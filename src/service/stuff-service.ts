import { StuffCategory } from "@prisma/client";
import { ResponseError } from "../error/response-error";
import { supabase } from "../supabase-client";
import { prismaClient } from "../application/database";
import { mapToStuffResponse, StuffResponse } from "../model/stuff-model";

export class StuffService {
  async addStuff(
    tailorId: string,
    name: string,
    price: number,
    stuffCaetgory: StuffCategory,
    image: Express.Multer.File
  ): Promise<StuffResponse> {
    if (!image) throw new ResponseError(500, "Gambar tidak ditemukan");

    const fileName = `${tailorId}-${Date.now()}`;

    const { data, error } = await supabase.storage.from("stuffImages").upload(fileName, image.buffer, {
      contentType: image.mimetype
    });

    if (error) throw new ResponseError(500, "Gagal mengupload gambar ke database");

    const imageUrl = data?.path
      ? supabase.storage.from("stuffImages").getPublicUrl(data.path).data?.publicUrl || null
      : null;

    if (!imageUrl) throw new ResponseError(500, "Gagal membuat url gambar")

    const newStuff = await prismaClient.stuff.create({
      data: {
        tailorId,
        name,
        imageUrl,
        stuffCaetgory,
        price
      }
    });

    return mapToStuffResponse(newStuff);
  }

  async updateStuff(
    stuffId: string,
    tailorId: string,
    name?: string,
    price?: number,
    stuffCaetgory?: StuffCategory,
    image?: Express.Multer.File
  ) : Promise<StuffResponse> {

    const existingStuff = await prismaClient.stuff.findFirst({
      where: {
        id: stuffId,
        tailorId: tailorId,
      },
    });
  
    if (!existingStuff) {
      throw new ResponseError(400, "Data tidak ditemukan");
    }
  
    const updateData: any = {
      tailorId,
      updatedAt: new Date(),
    };
  
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (stuffCaetgory !== undefined) updateData.stuffCaetgory = stuffCaetgory;
  
    let imageUrl = existingStuff.imageUrl;
  
    if (image) {
      const fileName = `${tailorId}-${Date.now()}`;
  
      if (existingStuff.imageUrl) {
        try {
          const existingImagePath = this.extractImagePathFromUrl(existingStuff.imageUrl);
          
          if (existingImagePath) {
            const { error: deleteError } = await supabase.storage
              .from("stuffImages")
              .remove([existingImagePath]);
  
            if (deleteError) {
              console.error("Warning: Failed to delete old image:", deleteError);
            }
          }
        } catch (error) {
          console.error("Error processing old image:", error);
        }
      }
  
      const { data, error } = await supabase.storage
        .from("stuffImages")
        .upload(fileName, image.buffer, {
          contentType: image.mimetype,
          cacheControl: '3600',
          upsert: false
        });
  
      if (error) {
        throw new ResponseError(500, "Gagal mengupload gambar ke database");
      }
  
      const publicUrlResult = supabase.storage
        .from("stuffImages")
        .getPublicUrl(data.path);
  
      imageUrl = publicUrlResult.data?.publicUrl;
  
      if (!imageUrl) {
        throw new ResponseError(500, "Gagal membuat url gambar");
      }
  
      updateData.imageUrl = imageUrl;
    }
  
    try {
      const updatedStuff = await prismaClient.stuff.update({
        where: {
          id: stuffId,
        },
        data: updateData,
      });
  
      return mapToStuffResponse(updatedStuff);
    } catch (error) {
      throw new ResponseError(500, "Gagal update stuff");
    }
  
  }

  private extractImagePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'stuffImages');
      
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch (error) {
      console.error("Error extracting image path:", error);
      return null;
    }
  }

  async deleteStuff(stuffId: string, tailorId: string) {
    const existingStuff = await prismaClient.stuff.findFirst({
      where: {
        id: stuffId,
        tailorId: tailorId
      }
    });

    if (!existingStuff) {
      throw new ResponseError(400, 'Stuff Tidak Ditemukan');
    }

    await prismaClient.stuff.delete({
      where: { id: stuffId }
    });

    return { success: true };
  }


}