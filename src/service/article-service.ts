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
            throw new ResponseError(
              500,
              "failed-upload-image-to-database"
            );
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
            imageUrl
          },
        })
    
        return newArticle
      }
}