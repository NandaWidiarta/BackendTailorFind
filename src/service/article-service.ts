import { Prisma } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { supabase } from "../supabase-client";

export class ArticleService {
  static async addArticle(
    tailorId: string,
    authorName: string,
    title: string,
    content: string,
    image?: Express.Multer.File
  ) {
    let imageUrl: string | null = null;
    if (image) {
      const fileName = `${tailorId}-${Date.now()}`;

      const { data, error } = await supabase.storage
        .from("articleImages")
        .upload(fileName, image.buffer, {
          contentType: image.mimetype,
        });

      if (error) {
        throw new ResponseError(500, "failed-upload-image-to-database");
      }

      imageUrl = data?.path
        ? supabase.storage.from("articleImages").getPublicUrl(data.path).data
            ?.publicUrl || null
        : null;

      if (!imageUrl) {
        throw new ResponseError(500, "failed-to-generate-image-url");
      }
    }

    const newArticle = await prismaClient.article.create({
      data: {
        tailorId,
        authorName,
        title,
        content,
        imageUrl,
      },
    });

    return newArticle;
  }

  static async getAllArticles(page: number = 1, pageSize: number = 8) {
    const totalArticles = await prismaClient.article.count();

    const skip = (page - 1) * pageSize;

    const articles = await prismaClient.article.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const totalPages = Math.ceil(totalArticles / pageSize);

    return {
      articles,
      meta: {
        totalData: totalArticles,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  }

  static async getArticleDetail(articleId: string) {
    const article = await prismaClient.article.findUnique({
      where: { id: articleId }
    });

    return {
      article,
    };
  }

  static async searchArticle(name: string, page = 1, pageSize = 8, userId?: string, searchMode?: 'own' | 'others' | 'all') {
    const searchTerms = name.toLowerCase().split(/\s+/);
    console.log("search terms", searchTerms)

    let whereCondition: any = {
      AND: searchTerms.map(term => ({
        title: {
          contains: term,
          mode: Prisma.QueryMode.insensitive
        }
      }))
    };
    
    if (userId && searchMode) {
      if (searchMode === 'own') {
        whereCondition = {
          ...whereCondition,
          tailorId: userId
        };
      } else if (searchMode === 'others') {
        whereCondition = {
          ...whereCondition,
          NOT: {
            tailorId: userId
          }
        };
      }
    }

    const articles = await prismaClient.article.findMany({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    
    const totalArticles = await prismaClient.article.count({
      where: whereCondition
    });

    const totalPages = Math.ceil(totalArticles / pageSize);

    return {
      data: articles,
      meta: {
        totalData: totalArticles,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  }


  //Tailors API
  static async getAllArticleTailor(
    tailorId: string,
    type: "own" | "others" = "own",
    page: number = 1,
    limit: number = 8
  ) {
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 20 ? limit : 8;
    const skip = (validPage - 1) * validLimit;

    const filter =
      tailorId && type === "own"
        ? { tailorId }
        : tailorId && type === "others"
        ? { tailorId: { not: tailorId } }
        : {};

    const artciles = await prismaClient.article.findMany({
      where: filter,
      skip,
      take: validLimit,
      orderBy: { createdAt: "desc" },
    });

    const totalArticles = await prismaClient.article.count({
      where: filter,
    });

    const totalPages = Math.ceil(totalArticles / validLimit);

    return {
      artciles,
      meta: {
        totalData: totalArticles,
        totalPages,
        currentPage: validPage,
        pageSize: validLimit,
      },
    };
  }

  static async updateArticle(
    articleId: string,
    tailorId: string,
    title?: string,
    content?: string,
    image?: Express.Multer.File
  ) {
    const existingArticle = await prismaClient.article.findFirst({
      where: {
        id: articleId,
        tailorId: tailorId,
      },
    });

    if (!existingArticle) {
      throw new ResponseError(404, "article-not-found");
    }

    const updateData: any = {
      tailorId,
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined)
      updateData.content = content;

    let imageUrl = existingArticle.imageUrl;

    if (image) {
      const fileName = `${tailorId}-${Date.now()}`;

      if (existingArticle.imageUrl) {
        try {
          const existingImagePath = this.extractImagePathFromUrl(
            existingArticle.imageUrl
          );

          if (existingImagePath) {
            const { error: deleteError } = await supabase.storage
              .from("articleImages")
              .remove([existingImagePath]);

            if (deleteError) {
              console.error(
                "Warning: Failed to delete old image:",
                deleteError
              );
            }
          }
        } catch (error) {
          console.error("Error processing old image:", error);
        }
      }

      const { data, error } = await supabase.storage
        .from("articleImages")
        .upload(fileName, image.buffer, {
          contentType: image.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new ResponseError(500, "failed-upload-image-to-database");
      }

      const publicUrlResult = supabase.storage
        .from("articleImages")
        .getPublicUrl(data.path);

      imageUrl = publicUrlResult.data?.publicUrl;

      if (!imageUrl) {
        throw new ResponseError(500, "failed-to-generate-image-url");
      }

      updateData.imageUrl = imageUrl;
    }

    try {
      const updatedArticle = await prismaClient.article.update({
        where: {
          id: articleId,
        },
        data: updateData,
      });

      return updatedArticle;
    } catch (error) {
      throw new ResponseError(500, "failed-to-update-article");
    }
  }

  private static extractImagePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split("/");
      const bucketIndex = urlParts.findIndex((part) => part === "articleImages");

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join("/");
      }
      return null;
    } catch (error) {
      console.error("Error extracting image path:", error);
      return null;
    }
  }

  static async deleteArticle(articleId: string, tailorId: string) {
    const existingArticle = await prismaClient.article.findFirst({
      where: {
        id: articleId,
        tailorId: tailorId,
      },
    });

    if (!existingArticle) {
      throw new ResponseError(404, "article-not-found");
    }

    await prismaClient.article.delete({
      where: { id: articleId },
    });

    return { success: true };
  }






}
