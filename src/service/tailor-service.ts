import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import {
  CreateCustomerRequest,
  CustomerResponse,
  CustomersResponse,
  LoginCustomerRequest,
  toCustomerResponse,
} from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import {
  CreateTailorRequest,
  StuffFilterParams,
  TailorResponse,
  toTailorResponse,
} from "../model/tailor-model";
import { supabase } from "../supabase-client";
import { Role } from "@prisma/client";

export class TailorService {
  static async login(request: LoginCustomerRequest): Promise<TailorResponse> {
    const loginRequest = Validation.validate(CustomerValidation.LOGIN, request)

    let tailor = await prismaClient.user.findUnique({
      where: {
        email: loginRequest.email,
      },
    })

    if (!tailor) {
      throw new ResponseError(401, "Email or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      tailor.password
    )
    if (!isPasswordValid) {
      throw new ResponseError(401, "Email or password is wrong")
    }

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

    tailor = await prismaClient.user.update({
      where: {
        email: loginRequest.email,
      },
      data: {
        token: newToken,
      },
      include: {
        tailorProfile: true,
      }
    })

    const response = toTailorResponse(tailor)
    response.token = tailor.token!
    return response
  }

  static async register(
    request: CreateTailorRequest,
    profilePictureFile?: Express.Multer.File,
    certificateFiles?: Express.Multer.File[] // Tambahkan array file
  ): Promise<TailorResponse> {
    const registerRequest = request;

    const isEmailExist = await prismaClient.user.count({
      where: { email: request.email },
    });

    if (isEmailExist > 0) {
      throw new ResponseError(400, "Email already exist");
    }

    const isPhoneExist = await prismaClient.user.count({
      where: { phoneNumber: request.phoneNumber },
    });

    if (isPhoneExist > 0) {
      throw new ResponseError(400, "Phone number already exist");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

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
    }

    let certificateUrls: string[] = [];
    if (certificateFiles && certificateFiles.length > 0) {
      for (const file of certificateFiles) {
        const fileName = `${registerRequest.email}-${Date.now()}`;
        const { data, error } = await supabase.storage
          .from("certificates")
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (error) {
          throw new ResponseError(500, "Failed to upload certificate");
        }

        if (data?.path) {
          const publicUrl = `${
            supabase.storage.from("certificates").getPublicUrl(data.path).data
              .publicUrl
          }`;
          certificateUrls.push(publicUrl);
        }
      }
    }

    registerRequest.profilePicture = profilePictureUrl;
    registerRequest.certificate = certificateUrls;

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

    console.log("service gender: ", registerRequest.gender)

    const tailor = await prismaClient.user.create({
      data: {
        firstname: registerRequest.firstname,
        lastname: registerRequest.lastname,
        email: registerRequest.email,
        phoneNumber: registerRequest.phoneNumber,
        password: registerRequest.password,
        role: Role.TAILOR,
        token: newToken,
        tailorProfile: {
          create: {
            provinceId: registerRequest.provinceId,
            regencyId: registerRequest.regencyId,
            districtId: registerRequest.districtId,
            villageId: registerRequest.villageId,
            addressDetail: registerRequest.addressDetail,
            workEstimation: registerRequest.workEstimation,
            priceRange: registerRequest.priceRange,
            specialization: registerRequest.specialization,
            businessDescription: registerRequest.businessDescription,
            profilePicture: registerRequest.profilePicture,
            certificate: registerRequest.certificate,
            gender: registerRequest.gender,
          },
        },
      },
      include: {
        tailorProfile: true,
      },
    });

    return toTailorResponse(tailor);
  }

  static async getHomeData(tailorId: string) {

    if (!tailorId) {
      throw new ResponseError(400, "tailorId-not-found");
    }

    const rooms = await prismaClient.roomChat.findMany({
      where: { tailorId },
      select: { unreadCountCustomer: true },
    })

    const unreadMessagesCount = rooms.reduce(
      (total, room) => total + room.unreadCountCustomer,
      0
    )

    const tailorProfile = await prismaClient.tailorProfile.findUnique({
      where: { userId: tailorId },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    const latestArticles = await prismaClient.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    const latestStuff = await prismaClient.stuff.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    const latestCourses = await prismaClient.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return {
      tailorProfile,
      unreadMessagesCount,
      latestArticles,
      latestStuff,
      latestCourses
    };
  }

  static async getStuff(page: number = 1, pageSize: number = 8, tailorId: string) {
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
    ]);

    const totalPages = Math.ceil(totalStuff / pageSize);

    return {
      stuff,
      meta: {
        totalData: totalStuff,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  }

  static async filterStuff(params: StuffFilterParams, userId: string) {
    const {
      page = 1,
      pageSize = 8,
      name,
      stuffCategory,
      maxPrice,
    } = params;

    const AND: any[] = [];

    AND.push({ tailorId: userId });

    if (name) {
      AND.push({
        name: {
          contains: name,
          mode: "insensitive",
        },
      });
    }

    if (stuffCategory) {
      AND.push({
        stuffCaetgory: stuffCategory, 
      });
    }

    if (maxPrice !== undefined) {
      AND.push({
        price: {
          lte: maxPrice,
        },
      });
    }

    const whereConditions = AND.length > 0 ? { AND } : {};

    const totalStuffs = await prismaClient.stuff.count({
      where: whereConditions,
    });

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const stuffs = await prismaClient.stuff.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy: {
        createdAt: "desc", 
      },
    });

    const totalPages = Math.ceil(totalStuffs / pageSize);

    return {
      data: stuffs,
      meta: {
        totalData: totalStuffs,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  }

  static async updateTailorProfile(
    userId: string,
    data: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phoneNumber?: string;
      provinceId?: string;
      regencyId?: string;
      districtId?: string;
      villageId?: string;
      addressDetail?: string;
      workEstimation?: string;
      priceRange?: string;
      specialization?: string[];
      businessDescription?: string;
    },
    profilePicture?: Express.Multer.File,
  ): Promise<TailorResponse> {
    const existingUser = await prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        tailorProfile: true
      }
    });

    if (!existingUser) {
      throw new ResponseError(404, "user-not-found");
    }

    if (!existingUser.tailorProfile) {
      throw new ResponseError(404, "tailor-profile-not-found");
    }

    if (data.email && data.email !== existingUser.email) {
      const isEmailExist = await prismaClient.user.count({
        where: { 
          email: data.email,
          id: { not: userId }
        },
      });

      if (isEmailExist > 0) {
        throw new ResponseError(400, "email-already-exist");
      }
    }

    if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
      const isPhoneExist = await prismaClient.user.count({
        where: { 
          phoneNumber: data.phoneNumber,
          id: { not: userId }
        },
      });

      if (isPhoneExist > 0) {
        throw new ResponseError(400, "phone-number-already-exist");
      }
    }

    const userUpdateData: any = {};
    if (data.firstname !== undefined) userUpdateData.firstname = data.firstname;
    if (data.lastname !== undefined) userUpdateData.lastname = data.lastname;
    if (data.email !== undefined) userUpdateData.email = data.email;
    if (data.phoneNumber !== undefined) userUpdateData.phoneNumber = data.phoneNumber;

    const tailorProfileUpdateData: any = {};
    if (data.provinceId !== undefined) tailorProfileUpdateData.provinceId = data.provinceId;
    if (data.regencyId !== undefined) tailorProfileUpdateData.regencyId = data.regencyId;
    if (data.districtId !== undefined) tailorProfileUpdateData.districtId = data.districtId;
    if (data.villageId !== undefined) tailorProfileUpdateData.villageId = data.villageId;
    if (data.addressDetail !== undefined) tailorProfileUpdateData.addressDetail = data.addressDetail;
    if (data.workEstimation !== undefined) tailorProfileUpdateData.workEstimation = data.workEstimation;
    if (data.priceRange !== undefined) tailorProfileUpdateData.priceRange = data.priceRange;
    if (data.specialization !== undefined) tailorProfileUpdateData.specialization = data.specialization;
    if (data.businessDescription !== undefined) tailorProfileUpdateData.businessDescription = data.businessDescription;

    if (profilePicture) {
      const fileName = `${existingUser.email}-${Date.now()}`;
      if (existingUser.tailorProfile.profilePicture) {
        try {
          const existingImagePath = this.extractImagePathFromUrl(
            existingUser.tailorProfile.profilePicture,
            "profile"
          );

          if (existingImagePath) {
            const { error: deleteError } = await supabase.storage
              .from("profile")
              .remove([existingImagePath]);

            if (deleteError) {
              console.error(
                "Warning: Failed to delete old profile image:",
                deleteError
              );
            }
          }
        } catch (error) {
          console.error("Error processing old profile image:", error);
        }
      }

      const { data: uploadData, error } = await supabase.storage
        .from("profile")
        .upload(fileName, profilePicture.buffer, {
          contentType: profilePicture.mimetype,
        });

      if (error) {
        throw new ResponseError(500, "failed-to-upload-profile-picture");
      }

      const profilePictureUrl = uploadData?.path
        ? `${supabase.storage.from("profile").getPublicUrl(uploadData.path).data.publicUrl}`
        : null;

      if (profilePictureUrl) {
        tailorProfileUpdateData.profilePicture = profilePictureUrl;
      }
    }


    try {
      const updatedTailor = await prismaClient.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: userUpdateData
        });

        const updatedTailorProfile = await tx.tailorProfile.update({
          where: { userId: userId },
          data: tailorProfileUpdateData
        });

        return tx.user.findUnique({
          where: { id: userId },
          include: {
            tailorProfile: true
          }
        });
      });

      if (!updatedTailor) {
        throw new ResponseError(500, "failed-to-update-tailor-profile");
      }

      return toTailorResponse(updatedTailor);
    } catch (error) {
      console.error("Error updating tailor profile:", error);
      if (error instanceof ResponseError) {
        throw error;
      }
      throw new ResponseError(500, "failed-to-update-tailor-profile");
    }
  }

  private static extractImagePathFromUrl(url: string, bucketName: string): string | null {
    try {
      const urlParts = url.split("/");
      const bucketIndex = urlParts.findIndex((part) => part === bucketName);

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join("/");
      }
      return null;
    } catch (error) {
      console.error("Error extracting image path:", error);
      return null;
    }
  }

  static async getCertificates(
    tailorId: string
  ) {

    const existingUser = await prismaClient.user.findUnique({
      where: { id: tailorId },
      include: {
        tailorProfile: true
      }
    })

    if (!existingUser) {
      throw new ResponseError(404, "user-not-found");
    }

    return existingUser.tailorProfile?.certificate
  }

  static async addCertificates(
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
      throw new ResponseError(404, "user-not-found");
    }

    const existingCertificates = existingUser.tailorProfile?.certificate || [];
    let certificateUrls: string[] = [];
    for (const file of certificateFiles) {
      const fileName = `${existingUser.email}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("certificates")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw new ResponseError(500, "failed-to-upload-certificate");
      }

      if (data?.path) {
        const publicUrl = `${
          supabase.storage.from("certificates").getPublicUrl(data.path).data
            .publicUrl
        }`;
        certificateUrls.push(publicUrl);
      }
    }

    const updatedProfile = await prismaClient.tailorProfile.update({
      where: {
        userId: tailorId,
      },
      data: {
        certificate: [...existingCertificates, ...certificateUrls],
      },
    });

    return updatedProfile.certificate
  }

  static async deleteCertificate(
    tailorId: string,
    certificateUrl: string
  ) {

    const existingUser = await prismaClient.tailorProfile.findUnique({
      where: { userId: tailorId }
    })

    if (!existingUser) {
      throw new ResponseError(404, "user-not-found");
    }

    const certificates = existingUser.certificate || [];
    const certificateToDelete = certificates.find(url => 
      url.includes(certificateUrl)
    )

    if (!certificateToDelete) {
      throw new ResponseError(404, "Certificate-not-found");
    }

    try {
      const existingImagePath = this.extractImagePathFromUrlCertificate(certificateToDelete);
      
      if (existingImagePath) {
        const { error: deleteError } = await supabase.storage
          .from("certificates")
          .remove([existingImagePath]);

        if (deleteError) {
          console.error("Warning: Failed to delete old image:", deleteError);
        }
      }
    } catch (error) {
      console.error("Error processing old image:", error);
    }

    const updatedCertificates = certificates.filter(url => url !== certificateToDelete)

    const updatedProfile = await prismaClient.tailorProfile.update({
      where: {
        userId: tailorId,
      },
      data: {
        certificate: updatedCertificates,
      },
    });

    return updatedProfile.certificate
  }

  private static extractImagePathFromUrlCertificate(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'certificates');
      
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch (error) {
      console.error("Error extracting image path:", error);
      return null;
    }
  }

  static async registerV2(
    request: CreateTailorRequest,
    profilePictureFile?: Express.Multer.File,
    certificateFiles?: Express.Multer.File[]
  ): Promise<TailorResponse> {
    const registerRequest = request;

    const isEmailExist = await prismaClient.user.count({
      where: { email: request.email },
    });

    if (isEmailExist > 0) {
      throw new ResponseError(400, "Email already exist");
    }

    const isPhoneExist = await prismaClient.user.count({
      where: { phoneNumber: request.phoneNumber },
    });

    if (isPhoneExist > 0) {
      throw new ResponseError(400, "Phone number already exist");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

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
    }

    let certificateUrls: string[] = [];
    if (certificateFiles && certificateFiles.length > 0) {
      for (const file of certificateFiles) {
        const fileName = `${registerRequest.email}-${Date.now()}`;
        const { data, error } = await supabase.storage
          .from("certificates")
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (error) {
          throw new ResponseError(500, "Failed to upload certificate");
        }

        if (data?.path) {
          const publicUrl = `${
            supabase.storage.from("certificates").getPublicUrl(data.path).data
              .publicUrl
          }`;
          certificateUrls.push(publicUrl);
        }
      }
    }

    registerRequest.profilePicture = profilePictureUrl;
    registerRequest.certificate = certificateUrls;

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

    const tailor = await prismaClient.user.create({
      data: {
        id: authData.user.id,
        firstname: registerRequest.firstname,
        lastname: registerRequest.lastname,
        email: registerRequest.email,
        phoneNumber: registerRequest.phoneNumber,
        password: registerRequest.password,
        role: Role.TAILOR,
        tailorProfile: {
          create: {
            provinceId: registerRequest.provinceId,
            regencyId: registerRequest.regencyId,
            districtId: registerRequest.districtId,
            villageId: registerRequest.villageId,
            addressDetail: registerRequest.addressDetail,
            workEstimation: registerRequest.workEstimation,
            priceRange: registerRequest.priceRange,
            specialization: registerRequest.specialization,
            businessDescription: registerRequest.businessDescription,
            profilePicture: registerRequest.profilePicture,
            certificate: registerRequest.certificate,
          },
        },
      },
      include: {
        tailorProfile: true,
      },
    });

    const response =  toTailorResponse(tailor);
    response.token = authData.session?.access_token || ''
    return response
  }
}
