import { Prisma } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { ArticleResponse, mapToArticleResponse } from "../model/article-model";
import { supabase } from "../supabase-client";

export class ArticleService {
  async addArticle(
    tailorId: string,
    title: string,
    content: string,
    image?: Express.Multer.File
  ): Promise<ArticleResponse> {
    if (!image) throw new ResponseError(500, "Gambar tidak ditemukan")

    const fileName = `${tailorId}-${Date.now()}`
    const { data, error } = await supabase.storage.from("articleImages").upload(fileName, image.buffer, {
      contentType: image.mimetype
    })

    if (error) throw new ResponseError(500, "Gagal mengupload gambar ke database")

    const imageUrl = data?.path ? supabase.storage.from("articleImage").getPublicUrl(data.path).data?.publicUrl || null : null
    if (!imageUrl) throw new ResponseError(500, "Gagal membuat url gambar")

    const newArticle = await prismaClient.article.create({
      data: {
        tailorId,
        imageUrl,
        title,
        content,
      }
    })

    const tailor = await prismaClient.user.findUnique({
      where: { id: tailorId },
      select: { firstname: true, lastname: true }
    })

    return {
      ...newArticle,
      authorName: `${tailor?.firstname || ""} ${tailor?.lastname || ""}`.trim()
    }
  }

  async getAllArticles(page: number = 1, pageSize: number = 8) {
    const totalArticles = await prismaClient.article.count()
    const skip = (page - 1) * pageSize

    const articles = await prismaClient.article.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        tailor: {
          include: {
            user: {
              select: { firstname: true, lastname: true }
            }
          }
        }
      }
    })
    const totalPages = Math.ceil(totalArticles / pageSize)

    return {
      articles: articles.map(mapToArticleResponse),
      meta: {
        totalData: totalArticles,
        totalPages,
        currentPage: page,
        pageSize,
      }
    }
  }

  async getArticleDetail(articleId: string): Promise<ArticleResponse> {
    const article = await prismaClient.article.findUnique({
      where: { id: articleId },
      include: {
        tailor: {
          include: {
            user: {
              select: { firstname: true, lastname: true }
            }
          }
        }
      }
    })

    if (!article) throw new ResponseError(400, "Artikel tidak ditemukan")

    return mapToArticleResponse(article)
  }

  async searchArticle(name: string, page = 1, pageSize = 8, userId?: string, searchMode?: 'own' | 'others' | 'all') {
    const searchTerms = name.toLowerCase().split(/\s+/)

    let whereCondition: any = {
      AND: searchTerms.map(term => ({
        title: {
          contains: term,
          mode: Prisma.QueryMode.insensitive
        }
      }))
    }

    if (userId && searchMode) {
      if (searchMode === 'own') {
        whereCondition = {
          ...whereCondition,
          tailorId: userId
        }
      } else if (searchMode === 'others') {
        whereCondition = {
          ...whereCondition,
          NOT: {
            tailorId: userId
          }
        }
      }
    }

    const [articles, totalArticles] = await Promise.all([
      prismaClient.article.findMany({
        where: whereCondition,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          tailor: {
            include: {
              user: {
                select: { firstname: true, lastname: true }
              }
            }
          }
        }
      }),
      prismaClient.article.count({ where: whereCondition })
    ])

    const result: ArticleResponse[] = articles.map(mapToArticleResponse)

    return {
      data: result,
      meta: {
        totalData: totalArticles,
        totalPages: Math.ceil(totalArticles / pageSize),
        currentPage: page,
        pageSize,
      },
    }
  }


  //Tailors API
  async getAllArticleTailor(tailorId: string, type: "own" | "others" = "own", page: number = 1, limit: number = 8) {
    const validPage = page > 0 ? page : 1
    const validLimit = limit > 0 && limit <= 20 ? limit : 8
    const skip = (validPage - 1) * validLimit

    const filter = tailorId && type === "own" ? { tailorId } : { tailorId: { not: tailorId } }

    const [articles, totalArticles] = await Promise.all([
      prismaClient.article.findMany({
        where: filter,
        skip,
        take: validLimit,
        orderBy: { createdAt: "desc" },
        include: {
          tailor: {
            include: {
              user: {
                select: { firstname: true, lastname: true }
              }
            }
          }
        }
      }),
      prismaClient.article.count({ where: filter })
    ])

    const result: ArticleResponse[] = articles.map(mapToArticleResponse)

    return {
      articles: result,
      meta: {
        totalData: totalArticles,
        totalPages: Math.ceil(totalArticles / validLimit),
        currentPage: validPage,
        pageSize: validLimit,
      },
    }
  }


  async updateArticle(articleId: string, tailorId: string, title?: string, content?: string, image?: Express.Multer.File): Promise<ArticleResponse> {
    const existingArticle = await prismaClient.article.findFirst({
      where: { id: articleId, tailorId }
    })

    if (!existingArticle) throw new ResponseError(400, "Artikel tidak ditemukan")

    const updateData: any = {
      tailorId,
      updatedAt: new Date()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content

    if (image) {
      const fileName = `${tailorId}-${Date.now()}`

      if (existingArticle.imageUrl) {
        const existingImagePath = this.extractImagePathFromUrl(existingArticle.imageUrl)
        if (existingImagePath) await supabase.storage.from("articleImages").remove([existingImagePath])
      }

      const { data, error } = await supabase.storage.from("articleImages").upload(fileName, image.buffer, {
        contentType: image.mimetype,
        cacheControl: "3600",
        upsert: false
      })

      if (error) throw new ResponseError(500, "Gagal mengupload gambar ke database")

      const publicUrlResult = supabase.storage.from("articleImages").getPublicUrl(data.path)
      const imageUrl = publicUrlResult.data?.publicUrl
      if (!imageUrl) throw new ResponseError(500, "Gagal membuat url gambar")

      updateData.imageUrl = imageUrl
    }

    const updatedArticle = await prismaClient.article.update({
      where: { id: articleId },
      include: {
        tailor: {
          include: {
            user: {
              select: {
                firstname: true,
                lastname: true
              }
            }
          }
        }
      },
      data: updateData
    })

    return mapToArticleResponse(updatedArticle)
  }

  private extractImagePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split("/")
      const bucketIndex = urlParts.findIndex((part) => part === "articleImages")

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join("/")
      }
      return null
    } catch (error) {
      console.error("Error extracting image path:", error)
      return null
    }
  }

  async deleteArticle(articleId: string, tailorId: string) {
    const existingArticle = await prismaClient.article.findFirst({ where: { id: articleId, tailorId } })
    if (!existingArticle) throw new ResponseError(400, "Artikel tidak ditemukan")

    await prismaClient.article.delete({ where: { id: articleId } })

    return { success: true }
  }






}
