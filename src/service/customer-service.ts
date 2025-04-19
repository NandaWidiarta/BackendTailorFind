import { Prisma, PrismaClient, Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import {
  CreateCustomerRequest,
  CustomerResponse,
  CustomersResponse,
  LoginCustomerRequest,
  RatingReviewRequest,
  TailorFilterParams,
  toCustomerResponse,
} from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabase-client";
import { Gender } from "@prisma/client";
import { snap } from "../instance/midtrans-client";

export class CustomerService {
  static async register(
    registerRequest: CreateCustomerRequest,
    profilePictureFile?: Express.Multer.File,
  ): Promise<CustomerResponse> {
    // const registerRequest = Validation.validate(
    //   CustomerValidation.REGISTER,
    //   request
    // )
    console.log('email' , registerRequest.email)
    console.log('tess' , registerRequest)

    const totalUserWithSameEmail = await prismaClient.user.count({
      where: {
        email: registerRequest.email,
      },
    })

    if (totalUserWithSameEmail != 0) {
      throw new ResponseError(400, "Email udah digunakan")
    }

    let profilePictureUrl: string | null = null;
    if (profilePictureFile) {
      const fileName = `${registerRequest.email}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("profile")
        .upload(fileName, profilePictureFile.buffer, {
          contentType: profilePictureFile.mimetype,
        });

      if (error) {
        throw new ResponseError(500, "Failed to upload profile picture");
      }

      profilePictureUrl = data?.path
        ? `${
            supabase.storage.from("profile").getPublicUrl(data.path).data
              .publicUrl
          }`
        : null
    } else {
      profilePictureUrl = "https://xtyrxekcsaesyyopouhh.supabase.co/storage/v1/object/public/profile/tes/user.png"
    }

    const isPhoneExist = await prismaClient.user.count({
      where: { phoneNumber: registerRequest.phoneNumber },
    });

    if (isPhoneExist > 0) {
      throw new ResponseError(400, "Phone number already exist");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
    registerRequest.role = Role.CUSTOMER

    let newToken = uuid()
    let existingToken = await prismaClient.user.findFirst({
      where: { token: newToken },
    })

    while (existingToken) {
      newToken = uuid()
      existingToken = await prismaClient.user.findFirst({
        where: { token: newToken },
      })
    }

    registerRequest.token = newToken
    registerRequest.profilePicture = profilePictureUrl

    const customer = await prismaClient.user.create({
      data: registerRequest,
    })

    return toCustomerResponse(customer)
  }

  static async login(request: LoginCustomerRequest): Promise<CustomerResponse> {
    const loginRequest = Validation.validate(CustomerValidation.LOGIN, request)

    let customer = await prismaClient.user.findUnique({
      where: {
        email: loginRequest.email,
      },
    })

    if (!customer) {
      throw new ResponseError(401, "Email or password is wrong")
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      customer.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "Email or password is wrong")
    }

    let newToken = uuid()
    let existingToken = await prismaClient.user.findFirst({
        where: { token: newToken },
    });

    while (existingToken) {
        newToken = uuid()
        existingToken = await prismaClient.user.findFirst({
            where: { token: newToken },
        })
    }

    customer = await prismaClient.user.update({
      where: {
        email: loginRequest.email,
      },
      data: {
        token: newToken,
      },
    });

    const response = toCustomerResponse(customer)
    response.token = customer.token!
    return response
  }

  static async addRatingReview(request: RatingReviewRequest, ratingImage?: Express.Multer.File,): Promise<String> {
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
        throw new ResponseError(500, "failed-upload-rating-image-to-database");
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

  static async getHomeData(customerId?: string) {
    
    let unreadMessagesCount : number | null = null
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

    const topTailors = await prismaClient.tailorProfile.findMany({
      orderBy: { averageRating: "desc" },
      take: 5,
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        province: {
          select: { name: true },
        },
        regency: {
          select: { name: true },
        },
        district: {
          select: { name: true },
        },
        village: {
          select: { name: true },
        },
      },
    });

    const latestArticles = await prismaClient.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    const latestCourses = await prismaClient.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    const simplifiedTailors = topTailors.map(tailor => ({
      id: tailor.id,
      userId: tailor.userId,
      firstname: tailor.user.firstname,
      lastname: tailor.user.lastname,
      addressDetail: tailor.addressDetail,
      workEstimation: tailor.workEstimation,
      priceRange: tailor.priceRange,
      specialization: tailor.specialization,
      businessDescription: tailor.businessDescription,
      profilePicture: tailor.profilePicture,
      certificate: tailor.certificate,
      averageRating: tailor.averageRating,
      gender: tailor.gender,
      provinceName: tailor.province.name,
      regencyName: tailor.regency.name,
      districtName: tailor.district.name,
      villageName: tailor.village.name
    }));
    
    return {
      unreadMessagesCount,
      topTailors: simplifiedTailors,
      latestArticles,
      latestCourses,
    };
  }

  static async getTailors(page: number = 1, pageSize: number = 8) {
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

    const formattedTailors = tailors.map(tailor => {
      if (!tailor.tailorProfile) {
        return {
          firstname: tailor.firstname,
          lastname: tailor.lastname,
        };
      }
      
      return {
        id: tailor.id,
        firstname: tailor.firstname,
        lastname: tailor.lastname,
        provinceName: tailor.tailorProfile.province.name,
        regencyName: tailor.tailorProfile.regency.name,
        districtName: tailor.tailorProfile.district.name,
        villageName: tailor.tailorProfile.village.name,
        addressDetail: tailor.tailorProfile.addressDetail,
        workEstimation: tailor.tailorProfile.workEstimation,
        priceRange: tailor.tailorProfile.priceRange,
        specialization: tailor.tailorProfile.specialization,
        profilePicture: tailor.tailorProfile.profilePicture,
        averageRating: tailor.tailorProfile.averageRating
      };
    });

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

  static async getFilteredTailors(params: TailorFilterParams) {
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

    const formattedTailors = tailors.map(tailor => {
      if (!tailor.tailorProfile) {
        return {
          firstname: tailor.firstname,
          lastname: tailor.lastname,
        };
      }
      
      return {
        id: tailor.id,
        firstname: tailor.firstname,
        lastname: tailor.lastname,
        provinceName: tailor.tailorProfile.province.name,
        regencyName: tailor.tailorProfile.regency.name,
        districtName: tailor.tailorProfile.district.name,
        villageName: tailor.tailorProfile.village.name,
        addressDetail: tailor.tailorProfile.addressDetail,
        workEstimation: tailor.tailorProfile.workEstimation,
        priceRange: tailor.tailorProfile.priceRange,
        specialization: tailor.tailorProfile.specialization,
        profilePicture: tailor.tailorProfile.profilePicture,
        averageRating: tailor.tailorProfile.averageRating,
        gender: tailor.tailorProfile.gender
      };
    });

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


  static async getTailorById(id: string) {
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
      throw new ResponseError(400, "tailor-not-found");
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
      profilePicture: tailorWithoutSensitiveInfo.tailorProfile?.profilePicture,
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
        authorName: article.authorName,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      })) || [],
      courses: tailorWithoutSensitiveInfo.tailorProfile?.courses
    };
  
    return formattedTailor;
  }


  static async updateCustomerProfile(
    userId: string,
    userData: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phoneNumber?: string;
      profilePicture?: string | null;
    }
  ) {
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

    const { password, createdAt, ...filteredUser } = updatedUser;
    return filteredUser;
  }
  

  static async registerCustomerV2(registerRequest: CreateCustomerRequest, profilePictureFile?: Express.Multer.File): Promise<CustomerResponse> {
    
    const emailExists = await prismaClient.user.count({
      where: { email: registerRequest.email }
    }) > 0
    
    if (emailExists) {
      throw new ResponseError(400, "Email sudah digunakan")
    }
    
    const phoneExists = await prismaClient.user.count({
      where: { phoneNumber: registerRequest.phoneNumber }
    }) > 0
    
    if (phoneExists) {
      throw new ResponseError(400, "Phone number already exists")
    }

    let profilePictureUrl: string | null = null;
    if (profilePictureFile) {
      const fileName = `${registerRequest.email}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("profile")
        .upload(fileName, profilePictureFile.buffer, {
          contentType: profilePictureFile.mimetype,
        });

      if (error) {
        throw new ResponseError(500, "Failed to upload profile picture");
      }

      profilePictureUrl = data?.path
        ? `${
            supabase.storage.from("profile").getPublicUrl(data.path).data
              .publicUrl
          }`
        : null
    } else {
      profilePictureUrl = "https://xtyrxekcsaesyyopouhh.supabase.co/storage/v1/object/public/profile/tes/user.png"
    }
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registerRequest.email,
      password: registerRequest.password
    })
    
    if (authError) {
      throw new ResponseError(400, authError.message)
    }
    
    if (!authData.user) {
      throw new ResponseError(500, "Failed to create user")
    }
    
    const customer = await prismaClient.user.create({
      data: {
        id: authData.user.id, 
        firstname: registerRequest.firstname,
        lastname: registerRequest.lastname,
        email: registerRequest.email,
        phoneNumber: registerRequest.phoneNumber,
        password: '', 
        role: Role.CUSTOMER,
        profilePicture: profilePictureUrl
      }
    })
    
    const response = toCustomerResponse(customer)
    response.token = authData.session?.access_token || ''
    return response
  }

}
