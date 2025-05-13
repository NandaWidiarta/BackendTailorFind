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
} from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabase-client";
import { Gender } from "@prisma/client";
import { snap } from "../instance/midtrans-client";
import { mapToArticleResponse } from "../model/article-model";
import { mapToCourseResponse } from "../model/course-model";

export class CustomerService {
  async addRatingReview(request: RatingReviewRequest, ratingImage?: Express.Multer.File,): Promise<String> {
    const ratingReview = await prismaClient.ratingReview.create({
      data: request,
    })

    
    if (ratingImage) {
      let imageUrl: string | null = null;
      const fileName = `${ratingReview.id}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("RatingReviewImage")
        .upload(fileName, ratingImage.buffer, {
          contentType: ratingImage.mimetype,
        });

      if (error) {
        throw new ResponseError(500, "Gagal mengupload gambar ke server");
      }

      imageUrl = data?.path
        ? supabase.storage.from("RatingReviewImage").getPublicUrl(data.path).data
            ?.publicUrl || null
        : null;

      if (imageUrl) {
        await prismaClient.ratingReview.update({
          where: { id: ratingReview.id },
          data: { image: imageUrl },
          select: { id: true, image: true },
        });
      }
    }

    const avgRating = await prismaClient.ratingReview.aggregate({
      where: { tailorId: request.tailorId },
      _avg: {
        rating: true,
      },
    })

    await prismaClient.tailorProfile.update({
      where: { userId: request.tailorId },
      data: {
        averageRating: avgRating._avg.rating ?? 0,
      },
    })

    return "Success Add Review"
  }

  async getHomeData(customerId?: string) {
    let unreadMessagesCount: number | null = null;
  
    if (customerId) {
      const rooms = await prismaClient.roomChat.findMany({
        where: { customerId },
        select: { unreadCountCustomer: true },
      });
      unreadMessagesCount = rooms.reduce(
        (total, room) => total + room.unreadCountCustomer,
        0
      );
    }
  
    const [topTailors, latestArticles, latestCourses] = await Promise.all([
      prismaClient.tailorProfile.findMany({
        orderBy: { averageRating: "desc" },
        take: 5,
        include: {
          user: { select: { firstname: true, lastname: true, profilePicture: true } },
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
    ]);
  
    return {
      unreadMessagesCount,
      topTailors: topTailors.map(mapTailorProfileResponse),
      latestArticles: latestArticles.map(mapToArticleResponse),
      latestCourses: latestCourses.map(mapToCourseResponse),
    };
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

    const totalPages = Math.ceil(totalTailors / pageSize);

    const formattedTailors = tailors.map(mapTailorFromUser);

    return {
      formattedTailors,
      meta: {
        totalData: totalTailors,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
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
    } = params;

    const whereConditions: any = {
      role: Role.TAILOR,
    };

    console.log(gender)

    const AND: any[] = [];

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
      });
    }

    if (provinceId) {
      AND.push({
        tailorProfile: {
          provinceId,
        },
      });
    }
    if (regencyId) {
      AND.push({
        tailorProfile: {
          regencyId,
        },
      });
    }
    if (districtId) {
      AND.push({
        tailorProfile: {
          districtId,
        },
      });
    }
    if (villageId) {
      AND.push({
        tailorProfile: {
          villageId,
        },
      });
    }

    if (specialization) {
      const specs = Array.isArray(specialization) 
        ? specialization 
        : specialization.split(',');
      
      AND.push({
        tailorProfile: {
          specialization: {
            hasEvery: specs,
          },
        },
      });
    }

    if (averageRating) {
      const avg = parseFloat(averageRating);
      if (!isNaN(avg)) {
        AND.push({
          tailorProfile: {
            averageRating: {
              gte: avg,
            },
          },
        });
      }
    }

    if (workEstimation) {
      AND.push({
        tailorProfile: {
          workEstimation: {
            contains: workEstimation,
            mode: "insensitive",
          },
        },
      });
    }

    if (priceRange) {
      AND.push({
        tailorProfile: {
          priceRange: {
            contains: priceRange,
            mode: "insensitive",
          },
        },
      });
    }

    if (gender) {
      AND.push({
        tailorProfile: {
          gender: gender as Gender, 
        },
      });
    }

    if (AND.length > 0) {
      whereConditions.AND = AND;
    }

    const totalTailors = await prismaClient.user.count({
      where: whereConditions,
    });

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const tailors = await prismaClient.user.findMany({
      where: whereConditions,
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
      take,

    });

    const totalPages = Math.ceil(totalTailors / pageSize);

    const formattedTailors = tailors.map(mapTailorFromUser);

    return {
      formattedTailors,
      meta: {
        totalData: totalTailors,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
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
    });
  
    if (!tailor) {
      throw new ResponseError(400, "Data tidak ditemukan");
    }
  
    const reviewsCount = tailor.receivedReviews.length;
  
    const { password, token, ...tailorWithoutSensitiveInfo } = tailor;

    console.log('tailor detail', tailorWithoutSensitiveInfo)
  
    const formattedTailor = {
      id: tailorWithoutSensitiveInfo.id,
      firstname: tailorWithoutSensitiveInfo.firstname,
      lastname: tailorWithoutSensitiveInfo.lastname,
      email: tailorWithoutSensitiveInfo.email,
      phoneNumber: tailorWithoutSensitiveInfo.phoneNumber,
      role: tailorWithoutSensitiveInfo.role,
      createdAt: tailorWithoutSensitiveInfo.createdAt,
      provinceName: tailorWithoutSensitiveInfo.tailorProfile?.province?.name,
      regencyName: tailorWithoutSensitiveInfo.tailorProfile?.regency?.name,
      districtName: tailorWithoutSensitiveInfo.tailorProfile?.district?.name,
      villageName: tailorWithoutSensitiveInfo.tailorProfile?.village?.name,
      addressDetail: tailorWithoutSensitiveInfo.tailorProfile?.addressDetail,
      workEstimation: tailorWithoutSensitiveInfo.tailorProfile?.workEstimation,
      priceRange: tailorWithoutSensitiveInfo.tailorProfile?.priceRange,
      specialization: tailorWithoutSensitiveInfo.tailorProfile?.specialization,
      businessDescription: tailorWithoutSensitiveInfo.tailorProfile?.businessDescription,
      profilePicture: tailorWithoutSensitiveInfo.profilePicture,
      certificate: tailorWithoutSensitiveInfo.tailorProfile?.certificate,
      averageRating: tailorWithoutSensitiveInfo.tailorProfile?.averageRating,
      reviewsCount: reviewsCount,
      reviews: tailorWithoutSensitiveInfo.receivedReviews.map(review => ({
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
      stuff: tailorWithoutSensitiveInfo.tailorProfile?.stuff.map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: item.stuffCaetgory,
        price: item.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })) || [],
      articles: tailorWithoutSensitiveInfo.tailorProfile?.article.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl,
        authorName: tailorWithoutSensitiveInfo.firstname + tailorWithoutSensitiveInfo.lastname,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      })) || [],
      courses: tailorWithoutSensitiveInfo.tailorProfile?.courses
    };
  
    return formattedTailor;
  }


  async updateCustomerProfile(
    userId: string,
    userData: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phoneNumber?: string;
      profilePicture?: string | null;
    }
  ) : Promise <UpdateCustomerProfileResponse> {
    const { profilePicture, ...others } = userData;

    const data = {
      ...others,
      ...(typeof profilePicture === 'string' && profilePicture.trim() !== ''
        ? { profilePicture }
        : {})
    };
  
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data
    });

    return mapUserToProfileResponse(updatedUser);
  }
  

}
