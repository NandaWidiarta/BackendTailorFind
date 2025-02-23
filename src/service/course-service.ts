import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { supabase } from "../supabase-client";

export class CourseService {
    static async addCourse(
        tailorId: string,
        authorName: string,
        courseName: string,
        shortDescription: string,
        registrationLink: string,
        description: string,
        image: Express.Multer.File
      ) {

        if (!image) {
        throw new ResponseError(500, "image-not-found")
        }

        const fileName = `${tailorId}-${Date.now()}`;

        const { data, error } = await supabase.storage
          .from("courseImage")
          .upload(fileName, image.buffer, {
            contentType: image.mimetype,
          });

        if (error) {
          throw new ResponseError(500, "failed-upload-image-to-database")
        }

        const imageUrl = data?.path
          ? supabase.storage.from("courseImage").getPublicUrl(data.path).data
              ?.publicUrl || null
          : null;

        if (!imageUrl) {
          throw new ResponseError(500, "failed-to-generate-image-url");
        }
    
        const newCourse = await prismaClient.course.create({
          data: {
            tailorId,
            authorName,
            courseName,
            shortDescription,
            registrationLink,
            description,
            imageUrl
          },
        })
    
        return newCourse
      }
}