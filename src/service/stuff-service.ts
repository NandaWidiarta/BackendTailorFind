import { StuffCategory } from "@prisma/client";
import { ResponseError } from "../error/response-error";
import { supabase } from "../supabase-client";
import { prismaClient } from "../application/database";

export class StuffService {
  static async addStuff(
    tailorId: string,
    name: string,
    price: number,
    stuffCaetgory: StuffCategory,
    image: Express.Multer.File
  ) {
    if (!image) {
      throw new ResponseError(500, "image-not-found");
    }

    const fileName = `${tailorId}-${Date.now()}`;

    const { data, error } = await supabase.storage
      .from("stuffImages")
      .upload(fileName, image.buffer, {
        contentType: image.mimetype,
      });

    if (error) {
      throw new ResponseError(500, "failed-upload-image-to-database");
    }

    const imageUrl = data?.path
      ? supabase.storage.from("stuffImages").getPublicUrl(data.path).data
          ?.publicUrl || null
      : null;

    if (!imageUrl) {
      throw new ResponseError(500, "failed-to-generate-image-url");
    }
    

    const newStuff = await prismaClient.stuff.create({
      data: {
        tailorId,
        name,
        imageUrl,
        stuffCaetgory,
        price,
      },
    });

    return newStuff;
  }
}