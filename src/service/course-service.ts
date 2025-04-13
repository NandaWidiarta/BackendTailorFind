import { Extensions } from "@prisma/client/runtime/library";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { supabase } from "../supabase-client";
import { Prisma } from "@prisma/client";

export class CourseService {
  static async addCourse(
    tailorId: string,
    authorName: string,
    courseName: string,
    shortDescription: string,
    registrationLink: string,
    description: string,
    place: string,
    courseDate: string,
    image: Express.Multer.File
  ) {
    if (!image) {
      throw new ResponseError(500, "image-not-found");
    }

    const fileName = `${tailorId}-${Date.now()}`;

    const { data, error } = await supabase.storage
      .from("courseImage")
      .upload(fileName, image.buffer, {
        contentType: image.mimetype,
      });

    if (error) {
      throw new ResponseError(500, "failed-upload-image-to-database");
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
        imageUrl,
        courseName,
        shortDescription,
        registrationLink,
        description,
        place,
        courseDate
      },
    });

    return newCourse;
  }

  static async getAllCourse(page: number = 1, pageSize: number = 8) {
    const totalCourse = await prismaClient.course.count();

    const skip = (page - 1) * pageSize;

    const courses = await prismaClient.course.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const totalPages = Math.ceil(totalCourse / pageSize);

    return {
      courses,
      meta: {
        totalData: totalCourse,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  }

  static async searchCourse(name: string, page = 1, pageSize = 8, userId?: string, searchMode?: 'own' | 'others' | 'all') {
    const searchTerms = name.toLowerCase().split(/\s+/);

    let whereCondition: any = {
      AND: searchTerms.map(term => ({
        courseName: {
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

    
    const courses = await prismaClient.course.findMany({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });
    
    const totalCourses = await prismaClient.course.count({
      where: whereCondition
    });

    const totalPages = Math.ceil(totalCourses / pageSize);

    return {
      data: courses,
      meta: {
        totalData: totalCourses,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  }

  static async getCourseDetail(courseId: string) {
    const course = await prismaClient.course.findUnique({
      where: { id: courseId },
    });

    return {
      course,
    };
  }

  ///Tailor Course API
  static async getAllCourseTailor(
    tailorId?: string,
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

    const courses = await prismaClient.course.findMany({
      where: filter,
      skip,
      take: validLimit,
      orderBy: { createdAt: "desc" },
    });

    const totalCourses = await prismaClient.course.count({
      where: filter,
    });

    const totalPages = Math.ceil(totalCourses / validLimit);

    return {
      courses,
      meta: {
        totalData: totalCourses,
        totalPages,
        currentPage: validPage,
        pageSize: validLimit,
      },
    };
  }

  static async updateCourse(
    courseId: string,
    tailorId: string,
    courseName?: string,
    shortDescription?: string,
    registrationLink?: string,
    description?: string,
    place?: string,
    courseDate?: string,
    image?: Express.Multer.File
  ) {
    const existingCourse = await prismaClient.course.findFirst({
      where: {
        id: courseId,
        tailorId: tailorId,
      },
    });

    if (!existingCourse) {
      throw new ResponseError(404, "course-not-found");
    }

    const updateData: any = {
      tailorId,
      updatedAt: new Date(),
    };

    if (courseName !== undefined) updateData.courseName = courseName;
    if (shortDescription !== undefined)
      updateData.shortDescription = shortDescription;
    if (registrationLink !== undefined)
      updateData.registrationLink = registrationLink;
    if (description !== undefined) updateData.description = description;
    if (place !== undefined) updateData.place = place;
    if (courseDate !== undefined) updateData.courseDate = courseDate;

    let imageUrl = existingCourse.imageUrl;

    if (image) {
      const fileName = `${tailorId}-${Date.now()}`;

      if (existingCourse.imageUrl) {
        try {
          const existingImagePath = this.extractImagePathFromUrl(
            existingCourse.imageUrl
          );

          if (existingImagePath) {
            const { error: deleteError } = await supabase.storage
              .from("courseImage")
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
        .from("courseImage")
        .upload(fileName, image.buffer, {
          contentType: image.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new ResponseError(500, "failed-upload-image-to-database");
      }

      const publicUrlResult = supabase.storage
        .from("courseImage")
        .getPublicUrl(data.path);

      imageUrl = publicUrlResult.data?.publicUrl;

      if (!imageUrl) {
        throw new ResponseError(500, "failed-to-generate-image-url");
      }

      updateData.imageUrl = imageUrl;
    }

    try {
      const updatedCourse = await prismaClient.course.update({
        where: {
          id: courseId,
        },
        data: updateData,
      });

      return updatedCourse;
    } catch (error) {
      throw new ResponseError(500, "failed-to-update-course");
    }
  }

  private static extractImagePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split("/");
      const bucketIndex = urlParts.findIndex((part) => part === "courseImage");

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join("/");
      }
      return null;
    } catch (error) {
      console.error("Error extracting image path:", error);
      return null;
    }
  }

  static async deleteCourse(courseId: string, tailorId: string) {
    const existingCourse = await prismaClient.course.findFirst({
      where: {
        id: courseId,
        tailorId: tailorId,
      },
    });

    if (!existingCourse) {
      throw new ResponseError(404, "course-not-found");
    }

    await prismaClient.course.delete({
      where: { id: courseId },
    });

    return { success: true };
  }
}


