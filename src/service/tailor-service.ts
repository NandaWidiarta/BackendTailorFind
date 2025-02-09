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
        : null;
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
          },
        },
      },
      include: {
        tailorProfile: true,
      },
    });

    return toTailorResponse(tailor);
  }
}
