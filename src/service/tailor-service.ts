import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import {
  CreateCustomerRequest,
  CustomerResponse,
  CustomersResponse,
  LoginRequest,
  TailorHomeResponse,
  toCustomerResponse,
} from "../dto/customer-dto";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import {
  CreateTailorRequest,
  StuffFilterParams,
  TailorResponse,
  toTailorHomeResponse,
  toTailorResponse,
} from "../dto/tailor-dto";
import { supabase } from "../supabase-client";
import { Role } from "@prisma/client";

export class TailorService {

  async getHomeData(tailorId: string) {
    if (!tailorId) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    const rooms = await prismaClient.roomChat.findMany({
      where: { tailorId },
      select: { unreadCountTailor: true },
    })

    const unreadMessagesCount = rooms.reduce(
      (total, room) => total + room.unreadCountTailor,
      0
    )

    const tailorProfile = await prismaClient.tailorProfile.findUnique({
      where: { userId: tailorId },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
            role: true,
            createdAt: true
          },
        },
        province: { select: { name: true } },
        regency: { select: { name: true } },
        district: { select: { name: true } },
        village: { select: { name: true } },
      },
    })

    if (!tailorProfile) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    const [latestArticles, latestStuff, latestCourses] = await Promise.all([
      prismaClient.article.findMany({
        where: { tailorId },
        include: {
          tailor: {
            include: {
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prismaClient.stuff.findMany({
        where: { tailorId },
        include: {
          tailor: {
            include: {
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prismaClient.course.findMany({
        where: { tailorId },
        include: {
          tailor: {
            include: {
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    const tailor = {
      ...tailorProfile,
    }

    const response = toTailorHomeResponse(tailor, unreadMessagesCount, latestArticles, latestStuff, latestCourses)

    return response
  }

  async getStuff(page: number = 1, pageSize: number = 8, tailorId: string) {
    const skip = (page - 1) * pageSize

    const [stuff, totalStuff] = await prismaClient.$transaction([
      prismaClient.stuff.findMany({
        where: { tailorId: tailorId },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prismaClient.stuff.count({
        where: { tailorId: tailorId }
      })
    ])

    const totalPages = Math.ceil(totalStuff / pageSize)

    return {
      stuff,
      meta: {
        totalData: totalStuff,
        totalPages,
        currentPage: page,
        pageSize,
      },
    }
  }

  async filterStuff(params: StuffFilterParams, userId: string) {
    const {
      page = 1,
      pageSize = 8,
      name,
      stuffCategory,
      maxPrice,
    } = params

    const AND: any[] = []

    AND.push({ tailorId: userId })

    if (name) {
      AND.push({
        name: {
          contains: name,
          mode: "insensitive",
        },
      })
    }

    if (stuffCategory) {
      AND.push({
        stuffCaetgory: stuffCategory,
      })
    }

    if (maxPrice !== undefined) {
      AND.push({
        price: {
          lte: maxPrice,
        },
      })
    }

    const whereConditions = AND.length > 0 ? { AND } : {}

    const totalStuffs = await prismaClient.stuff.count({
      where: whereConditions,
    })

    const skip = (page - 1) * pageSize
    const take = pageSize

    const stuffs = await prismaClient.stuff.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    })

    const totalPages = Math.ceil(totalStuffs / pageSize)

    return {
      data: stuffs,
      meta: {
        totalData: totalStuffs,
        totalPages,
        currentPage: page,
        pageSize,
      },
    }
  }

  async updateTailorProfile(
    userId: string,
    data: {
      firstname?: string
      lastname?: string
      email?: string
      phoneNumber?: string
      provinceId?: string
      regencyId?: string
      districtId?: string
      villageId?: string
      addressDetail?: string
      workEstimation?: string
      priceRange?: string
      specialization?: string[]
      businessDescription?: string
    },
    profilePicture?: Express.Multer.File,
  ): Promise<TailorResponse> {
    const existingUser = await prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        tailorProfile: true
      }
    })

    if (!existingUser) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    if (!existingUser.tailorProfile) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    if (data.email && data.email !== existingUser.email) {
      const isEmailExist = await prismaClient.user.count({
        where: {
          email: data.email,
          id: { not: userId }
        },
      })

      if (isEmailExist > 0) {
        throw new ResponseError(400, "Email sudah terdaftar")
      }
    }

    const userUpdateData: any = {}
    if (data.firstname !== undefined) userUpdateData.firstname = data.firstname
    if (data.lastname !== undefined) userUpdateData.lastname = data.lastname
    if (data.email !== undefined) userUpdateData.email = data.email
    if (data.phoneNumber !== undefined) userUpdateData.phoneNumber = data.phoneNumber

    const tailorProfileUpdateData: any = {}
    if (data.provinceId !== undefined) tailorProfileUpdateData.provinceId = data.provinceId
    if (data.regencyId !== undefined) tailorProfileUpdateData.regencyId = data.regencyId
    if (data.districtId !== undefined) tailorProfileUpdateData.districtId = data.districtId
    if (data.villageId !== undefined) tailorProfileUpdateData.villageId = data.villageId
    if (data.addressDetail !== undefined) tailorProfileUpdateData.addressDetail = data.addressDetail
    if (data.workEstimation !== undefined) tailorProfileUpdateData.workEstimation = data.workEstimation
    if (data.priceRange !== undefined) tailorProfileUpdateData.priceRange = data.priceRange
    if (data.specialization !== undefined) tailorProfileUpdateData.specialization = data.specialization
    if (data.businessDescription !== undefined) tailorProfileUpdateData.businessDescription = data.businessDescription

    if (profilePicture) {
      const fileName = `${existingUser.email}-${Date.now()}`
      if (existingUser.profilePicture) {
        try {
          const existingImagePath = this.extractImagePathFromUrl(
            existingUser.profilePicture,
            "profile"
          )

          if (existingImagePath) {
            const { error: deleteError } = await supabase.storage
              .from("profile")
              .remove([existingImagePath])

            if (deleteError) {
              console.error(
                "Warning: Failed to delete old profile image:",
                deleteError
              )
            }
          }
        } catch (error) {
          console.error("Error processing old profile image:", error)
        }
      }

      const { data: uploadData, error } = await supabase.storage
        .from("profile")
        .upload(fileName, profilePicture.buffer, {
          contentType: profilePicture.mimetype,
        })

      if (error) {
        throw new ResponseError(500, "Gagal mengupload gambar ke server")
      }

      const profilePictureUrl = uploadData?.path
        ? `${supabase.storage.from("profile").getPublicUrl(uploadData.path).data.publicUrl}`
        : null

      if (profilePictureUrl) {
        userUpdateData.profilePicture = profilePictureUrl
      }
    }


    try {
      const updatedTailor = await prismaClient.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: userUpdateData
        })

        const updatedTailorProfile = await tx.tailorProfile.update({
          where: { userId: userId },
          data: tailorProfileUpdateData
        })

        return tx.user.findUnique({
          where: { id: userId },
          include: {
            tailorProfile: true
          }
        })
      })

      if (!updatedTailor) {
        throw new ResponseError(500, "Gagal mengupdate data")
      }

      return toTailorResponse(updatedTailor)
    } catch (error) {
      console.error("Error updating tailor profile:", error)
      if (error instanceof ResponseError) {
        throw error
      }
      throw new ResponseError(500, "Gagal mengupdate data")
    }
  }

  private extractImagePathFromUrl(url: string, bucketName: string): string | null {
    try {
      const urlParts = url.split("/")
      const bucketIndex = urlParts.findIndex((part) => part === bucketName)

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join("/")
      }
      return null
    } catch (error) {
      console.error("Error extracting image path:", error)
      return null
    }
  }

  async getCertificates(
    tailorId: string
  ) {

    const existingUser = await prismaClient.user.findUnique({
      where: { id: tailorId },
      include: {
        tailorProfile: true
      }
    })

    if (!existingUser) {
      throw new ResponseError(404, "Data tidak ditemukan")
    }

    return existingUser.tailorProfile?.certificate
  }

  async addCertificates(
    tailorId: string,
    certificateFiles: Express.Multer.File[]
  ) {

    const existingUser = await prismaClient.user.findUnique({
      where: { id: tailorId },
      include: {
        tailorProfile: true
      }
    })

    if (!existingUser) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    const existingCertificates = existingUser.tailorProfile?.certificate || []
    let certificateUrls: string[] = []
    for (const file of certificateFiles) {
      const fileName = `${existingUser.email}-${Date.now()}`
      const { data, error } = await supabase.storage
        .from("certificates")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        })

      if (error) {
        throw new ResponseError(500, "Gagal mengupload gambar ke server")
      }

      if (data?.path) {
        const publicUrl = `${supabase.storage.from("certificates").getPublicUrl(data.path).data
          .publicUrl
          }`
        certificateUrls.push(publicUrl)
      }
    }

    const updatedProfile = await prismaClient.tailorProfile.update({
      where: {
        userId: tailorId,
      },
      data: {
        certificate: [...existingCertificates, ...certificateUrls],
      },
    })

    return updatedProfile.certificate
  }

  async deleteCertificate(
    tailorId: string,
    certificateUrl: string
  ) {

    const existingUser = await prismaClient.tailorProfile.findUnique({
      where: { userId: tailorId }
    })

    if (!existingUser) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    const certificates = existingUser.certificate || []
    const certificateToDelete = certificates.find(url =>
      url.includes(certificateUrl)
    )

    if (!certificateToDelete) {
      throw new ResponseError(400, "Data tidak ditemukan")
    }

    try {
      const existingImagePath = this.extractImagePathFromUrlCertificate(certificateToDelete)

      if (existingImagePath) {
        const { error: deleteError } = await supabase.storage
          .from("certificates")
          .remove([existingImagePath])

        if (deleteError) {
          console.error("Warning: Failed to delete old image:", deleteError)
        }
      }
    } catch (error) {
      console.error("Error processing old image:", error)
    }

    const updatedCertificates = certificates.filter(url => url !== certificateToDelete)

    const updatedProfile = await prismaClient.tailorProfile.update({
      where: {
        userId: tailorId,
      },
      data: {
        certificate: updatedCertificates,
      },
    })

    return updatedProfile.certificate
  }

  private extractImagePathFromUrlCertificate(url: string): string | null {
    try {
      const urlParts = url.split('/')
      const bucketIndex = urlParts.findIndex(part => part === 'certificates')

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join('/')
      }
      return null
    } catch (error) {
      console.error("Error extracting image path:", error)
      return null
    }
  }

  async getReviewData(id: string) {
    const tailor = await prismaClient.user.findFirst({
        where: {
            id: id,
            role: Role.TAILOR
        },
        include: {
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
            },
            tailorProfile: {
                select: {
                    averageRating: true
                }
            }
        }
    })

    if (!tailor) {
        throw new ResponseError(400, "Data tidak ditemukan")
    }

    const reviewsCount = tailor.receivedReviews.length
  
    const reviews = tailor.receivedReviews.map(review => ({
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
    }))

    const averageRating = tailor.tailorProfile?.averageRating || 0

    return {
        reviewsCount,
        reviews,
        averageRating
    }
}

}
