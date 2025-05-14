import { Extensions } from "@prisma/client/runtime/library";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { supabase } from "../supabase-client";
import { Prisma } from "@prisma/client";
import { CourseResponse, mapToCourseResponse } from "../model/course-model";

export class CourseService {
  async addCourse(
    tailorId: string,
    courseName: string,
    shortDescription: string,
    registrationLink: string,
    description: string,
    place: string,
    courseDate: string,
    image: Express.Multer.File
  ) {
    if (!image) throw new ResponseError(500, "Gambar tidak ditemukan")

    const fileName = `${tailorId}-${Date.now()}`
    const { data, error } = await supabase.storage.from("courseImage").upload(fileName, image.buffer, {
      contentType: image.mimetype
    })
    if (error) throw new ResponseError(500, "Gagal mengupload gambar ke database")

    const imageUrl = data?.path ? supabase.storage.from("courseImage").getPublicUrl(data.path).data?.publicUrl || null : null
    if (!imageUrl) throw new ResponseError(500, "Gagal membuat url gambar")

    const newCourse = await prismaClient.course.create({
      data: {
        tailorId,
        imageUrl,
        courseName,
        shortDescription,
        registrationLink,
        description,
        place,
        courseDate
      }
    })

    const tailor = await prismaClient.user.findUnique({ where: { id: tailorId }, select: { firstname: true, lastname: true } })

    return {
      ...newCourse,
      authorName: `${tailor?.firstname || ""} ${tailor?.lastname || ""}`.trim()
    }
  }

  async getAllCourse(page: number = 1, pageSize: number = 8) {
    const totalCourse = await prismaClient.course.count()

    const skip = (page - 1) * pageSize

    const courses = await prismaClient.course.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
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
      }
    })

    const totalPages = Math.ceil(totalCourse / pageSize)

    const result: CourseResponse[] = courses.map(mapToCourseResponse)

    return {
      courses: result,
      meta: {
        totalData: totalCourse,
        totalPages,
        currentPage: page,
        pageSize,
      },
    }
  }

  async searchCourse(name: string, page = 1, pageSize = 8, userId?: string, searchMode?: 'own' | 'others' | 'all') {
    const searchTerms = name.toLowerCase().split(/\s+/)
    let whereCondition: any = {
      AND: searchTerms.map(term => ({ courseName: { contains: term, mode: Prisma.QueryMode.insensitive } }))
    }

    if (userId && searchMode) {
      if (searchMode === 'own') whereCondition.tailorId = userId
      else if (searchMode === 'others') whereCondition.NOT = { tailorId: userId }
    }

    const [courses, totalCourses] = await Promise.all([
      prismaClient.course.findMany({
        where: whereCondition,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
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
        }
      }),
      prismaClient.course.count({ where: whereCondition })
    ])

    const result: CourseResponse[] = courses.map(mapToCourseResponse)

    return {
      data: result,
      meta: {
        totalData: totalCourses,
        totalPages: Math.ceil(totalCourses / pageSize),
        currentPage: page,
        pageSize,
      },
    }
  }

  async getCourseDetail(courseId: string) {
    const course = await prismaClient.course.findUnique({
      where: { id: courseId },
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
      }
    })

    if (!course) throw new ResponseError(400, "Kursus Tidak Ditemukan")

    const result: CourseResponse = mapToCourseResponse(course)

    return { course: result }
  }

  async getAllCourseTailor(
    tailorId?: string,
    type: "own" | "others" = "own",
    page: number = 1,
    limit: number = 8
  ) {
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 20)
    const skip = (validPage - 1) * validLimit

    const filter = tailorId && type === "own"
      ? { tailorId }
      : tailorId && type === "others"
        ? { tailorId: { not: tailorId } }
        : {}

    const [courses, totalCourses] = await Promise.all([
      prismaClient.course.findMany({
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
      prismaClient.course.count({ where: filter })
    ])

    const result: CourseResponse[] = courses.map(mapToCourseResponse)

    return {
      courses: result,
      meta: {
        totalData: totalCourses,
        totalPages: Math.ceil(totalCourses / validLimit),
        currentPage: validPage,
        pageSize: validLimit,
      }
    }
  }

  async updateCourse(
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
      where: { id: courseId, tailorId }
    })

    if (!existingCourse) throw new ResponseError(400, "Kursus tidak ditemukan")

    const updateData: any = {
      tailorId,
      updatedAt: new Date(),
    }

    if (courseName !== undefined) updateData.courseName = courseName
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription
    if (registrationLink !== undefined) updateData.registrationLink = registrationLink
    if (description !== undefined) updateData.description = description
    if (place !== undefined) updateData.place = place
    if (courseDate !== undefined) updateData.courseDate = courseDate

    if (image) {
      const fileName = `${tailorId}-${Date.now()}`

      if (existingCourse.imageUrl) {
        const existingImagePath = this.extractImagePathFromUrl(existingCourse.imageUrl)
        if (existingImagePath) {
          await supabase.storage.from("courseImage").remove([existingImagePath])
        }
      }

      const { data, error } = await supabase.storage.from("courseImage").upload(fileName, image.buffer, {
        contentType: image.mimetype,
        cacheControl: "3600",
        upsert: false
      })

      if (error) throw new ResponseError(500, "Gagal mengupload gambar ke database")

      const publicUrlResult = supabase.storage.from("courseImage").getPublicUrl(data.path)
      const imageUrl = publicUrlResult.data?.publicUrl
      if (!imageUrl) throw new ResponseError(500, "Gagal membuat url gambar")

      updateData.imageUrl = imageUrl
    }

    const updatedCourse = await prismaClient.course.update(
      {
        where: { id: courseId },
        include: {
          tailor: {
            include: {
              user: {
                select: { firstname: true, lastname: true }
              }
            }
          }
        },
        data: updateData
      })

    return mapToCourseResponse(updatedCourse)
  }

  private extractImagePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split("/")
      const bucketIndex = urlParts.findIndex((part) => part === "courseImage")

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join("/")
      }
      return null
    } catch (error) {
      console.error("Error extracting image path:", error)
      return null
    }
  }

  async deleteCourse(courseId: string, tailorId: string) {
    const existingCourse = await prismaClient.course.findFirst({
      where: {
        id: courseId,
        tailorId: tailorId,
      },
    })

    if (!existingCourse) {
      throw new ResponseError(404, "Kursus tidak ditemukan")
    }

    await prismaClient.course.delete({
      where: { id: courseId },
    })

    return { success: true }
  }
}


