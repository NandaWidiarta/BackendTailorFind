import { Prisma, PrismaClient, Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import {
  CreateCustomerRequest,
  CustomerResponse,
  CustomersResponse,
  LoginRequest,
  mapTailorFromUser,
  mapTailorProfileResponse,
  mapUserToProfileResponse,
  RatingReviewRequest,
  TailorFilterParams,
  toCustomerResponse,
  UpdateCustomerProfileResponse,
} from "../dto/customer-dto";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabase-client";
import { Gender } from "@prisma/client";
import { snap } from "../instance/midtrans-client";
import { mapToArticleResponse } from "../dto/article-dto";
import { mapToCourseResponse } from "../dto/course-dto";

export class CustomerService {
  async addRatingReview(request: RatingReviewRequest, ratingImage?: Express.Multer.File,): Promise<String> {
    const ratingReview = await prismaClient.ratingReview.create({
      data: request,
    })


    if (ratingImage) {
      let imageUrl: string | null = null
      const fileName = `${ratingReview.id}-${Date.now()}`
      const { data, error } = await supabase.storage
        .from("RatingReviewImage")
        .upload(fileName, ratingImage.buffer, {
          contentType: ratingImage.mimetype,
        })

      if (error) {
        throw new ResponseError(500, "Gagal mengupload gambar ke server")
      }

      imageUrl = data?.path
        ? supabase.storage.from("RatingReviewImage").getPublicUrl(data.path).data
          ?.publicUrl || null
        : null

      if (imageUrl) {
        await prismaClient.ratingReview.update({
          where: { id: ratingReview.id },
          data: { image: imageUrl },
          select: { id: true, image: true },
        })
      }
    }

    const avgRating = await prismaClient.ratingReview.aggregate({
      where: { tailorId: request.tailorId },
      _avg: {
        rating: true,
      },
    })

    const rawAverage = avgRating._avg.rating ?? 0;
    const roundedAverage = Math.round(rawAverage * 10) / 10;

    await prismaClient.tailorProfile.update({
      where: { userId: request.tailorId },
      data: {
        averageRating: roundedAverage,
      },
    })

    return "Success Add Review"
  }

  async getHomeData(customerId?: string) {
    let unreadMessagesCount: number | null = null

    if (customerId) {
      const rooms = await prismaClient.roomChat.findMany({
        where: { customerId },
        select: { unreadCountCustomer: true },
      })
      unreadMessagesCount = rooms.reduce(
        (total, room) => total + room.unreadCountCustomer,
        0
      )
    }

    const [topTailors, latestArticles, latestCourses] = await Promise.all([
      prismaClient.tailorProfile.findMany({
        orderBy: { averageRating: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, firstname: true, lastname: true, profilePicture: true } },
          province: { select: { name: true } },
          regency: { select: { name: true } },
          district: { select: { name: true } },
          village: { select: { name: true } },
        },
      }),
      prismaClient.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prismaClient.course.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    return {
      unreadMessagesCount,
      topTailors: topTailors.map(mapTailorProfileResponse),
      latestArticles: latestArticles.map(mapToArticleResponse),
      latestCourses: latestCourses.map(mapToCourseResponse),
    }
  }

  async getTailors(page: number = 1, pageSize: number = 8) {
    const totalTailors = await prismaClient.user.count({
      where: { role: Role.TAILOR },
    })

    const skip = (page - 1) * pageSize

    const tailors = await prismaClient.user.findMany({
      where: { role: Role.TAILOR },
      include: {
        tailorProfile: {
          include: {
            province: true,
            regency: true,
            district: true,
            village: true
          }
        }
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    })

    const totalPages = Math.ceil(totalTailors / pageSize)

    const formattedTailors = tailors.map(mapTailorFromUser)

    return {
      formattedTailors,
      meta: {
        totalData: totalTailors,
        totalPages,
        currentPage: page,
        pageSize,
      },
    }
  }

  async getFilteredTailors(params: TailorFilterParams) {
    const {
      page = 1,
      pageSize = 8,
      search,
      provinceId,
      regencyId,
      districtId,
      villageId,
      specialization,
      averageRating,
      workEstimation,
      priceRange,
      gender
    } = params

    const whereConditions: any = {
      role: Role.TAILOR,
    }


    const AND: any[] = []

    if (search) {
      AND.push({
        OR: [
          {
            firstname: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastname: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      })
    }

    if (provinceId) {
      AND.push({
        tailorProfile: {
          provinceId,
        },
      })
    }
    if (regencyId) {
      AND.push({
        tailorProfile: {
          regencyId,
        },
      })
    }
    if (districtId) {
      AND.push({
        tailorProfile: {
          districtId,
        },
      })
    }
    if (villageId) {
      AND.push({
        tailorProfile: {
          villageId,
        },
      })
    }

    if (specialization) {
      const specs = Array.isArray(specialization)
        ? specialization
        : specialization.split(',')

      AND.push({
        tailorProfile: {
          specialization: {
            hasEvery: specs,
          },
        },
      })
    }

    if (averageRating) {
      const avg = parseFloat(averageRating)
      if (!isNaN(avg)) {
        AND.push({
          tailorProfile: {
            averageRating: {
              gte: avg,
            },
          },
        })
      }
    }


    if (gender) {
      AND.push({
        tailorProfile: {
          gender: gender as Gender,
        },
      })
    }

    if (AND.length > 0) {
      whereConditions.AND = AND
    }

    const allCandidates = await prismaClient.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        tailorProfile: {
          select: {
            priceRange: true,
            workEstimation: true,
          },
        },
      },
    });

    const filteredCandidates = allCandidates.filter(tailor => {
      if (priceRange) {
        try {
          const price = parseInt(priceRange, 10);
          if (isNaN(price)) return false

          const priceRangeDB = tailor.tailorProfile?.priceRange
          if (!priceRangeDB) return false

          const [min, max] = priceRangeDB.split('-').map(Number)
          if (price < min || price > max) {
            return false
          }
        } catch (e) {
          return false
        }
      }

      if (workEstimation) {
        try {
          const days = parseInt(workEstimation, 10)
          if (isNaN(days)) return false

          const workEstimationDB = tailor.tailorProfile?.workEstimation
          if (!workEstimationDB) return false

          const [min, max] = workEstimationDB.match(/\d+/g)?.map(Number) || [0, 0]
          if (days < min || days > max) {
            return false
          }
        } catch (e) {
          return false
        }
      }

      return true
    })

    const filteredIds = filteredCandidates.map(t => t.id)

    const totalTailors = filteredIds.length
    const totalPages = Math.ceil(totalTailors / pageSize)

    const skip = (page - 1) * pageSize
    const paginatedIds = filteredIds.slice(skip, skip + pageSize)

    if (paginatedIds.length === 0) {
      return {
        formattedTailors: [],
        meta: { totalData: totalTailors, totalPages, currentPage: page, pageSize },
      }
    }

    const tailors = await prismaClient.user.findMany({
      where: {
        id: { in: paginatedIds },
      },
      include: {
        tailorProfile: {
          include: {
            province: true,
            regency: true,
            district: true,
            village: true,
          },
        },
      },
    })

    const formattedTailors = tailors.map(mapTailorFromUser)

    return {
      formattedTailors,
      meta: {
        totalData: totalTailors,
        totalPages,
        currentPage: page,
        pageSize,
      },
    }
  }


  async getTailorById(id: string) {
    const tailor = await prismaClient.user.findFirst({
      where: {
        id: id,
        role: Role.TAILOR
      },
      include: {
        tailorProfile: {
          include: {
            province: true,
            regency: true,
            district: true,
            village: true,
            stuff: true,
            article: true,
            courses: true
          }
        },
        receivedReviews: {
          include: {
            customer: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                profilePicture: true
              }
            }
          }
        }
      }
    })

    if (!tailor) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    const reviewsCount = tailor.receivedReviews.length

    const formattedTailor = {
      id: tailor.id,
      firstname: tailor.firstname,
      lastname: tailor.lastname,
      email: tailor.email,
      phoneNumber: tailor.phoneNumber,
      role: tailor.role,
      createdAt: tailor.createdAt,
      provinceName: tailor.tailorProfile?.province?.name,
      regencyName: tailor.tailorProfile?.regency?.name,
      districtName: tailor.tailorProfile?.district?.name,
      villageName: tailor.tailorProfile?.village?.name,
      addressDetail: tailor.tailorProfile?.addressDetail,
      workEstimation: tailor.tailorProfile?.workEstimation,
      priceRange: tailor.tailorProfile?.priceRange,
      specialization: tailor.tailorProfile?.specialization,
      businessDescription: tailor.tailorProfile?.businessDescription,
      profilePicture: tailor.profilePicture,
      certificate: tailor.tailorProfile?.certificate,
      averageRating: tailor.tailorProfile?.averageRating,
      reviewsCount: reviewsCount,
      reviews: tailor.receivedReviews.map(review => ({
        id: review.id,
        rating: review.rating,
        review: review.review,
        image: review.image,
        createdAt: review.createdAt,
        customer: {
          id: review.customer.id,
          name: `${review.customer.firstname} ${review.customer.lastname || ''}`,
          imageUrl: review.customer.profilePicture
        }
      })),
      stuff: tailor.tailorProfile?.stuff.map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: item.stuffCaetgory,
        price: item.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })) || [],
      articles: tailor.tailorProfile?.article.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl,
        authorName: tailor.firstname + tailor.lastname,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      })) || [],
      courses: tailor.tailorProfile?.courses
    }

    return formattedTailor
  }


  async updateCustomerProfile(
    userId: string,
    userData: {
      firstname?: string
      lastname?: string
      email?: string
      phoneNumber?: string
      profilePicture?: string | null
    }
  ): Promise<UpdateCustomerProfileResponse> {
    const { profilePicture, ...others } = userData

    const data = {
      ...others,
      ...(typeof profilePicture === 'string' && profilePicture.trim() !== ''
        ? { profilePicture }
        : {})
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data
    })

    return mapUserToProfileResponse(updatedUser)
  }


}
