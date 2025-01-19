import { Customer } from "@prisma/client";
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
import { CustomerRequest } from "../type/user-request";
import {
  CreateTailorRequest,
  TailorResponse,
  toTailorResponse,
} from "../model/tailor-model";
import { supabase } from "../supabase-client";

export class TailorService {
  // static async register(request: CreateTailorRequest): Promise<TailorResponse> {
  //   // const registerRequest = Validation.validate(CustomerValidation.REGISTER, request);
  //   const registerRequest = request;

  //   const totalUserWithSameEmail = await prismaClient.tailor.count({
  //     where: {
  //       email: registerRequest.email,
  //     },
  //   });

  //   if (totalUserWithSameEmail != 0) {
  //     throw new ResponseError(400, "Email already exist");
  //   }

  //   registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

  //   const tailor = await prismaClient.tailor.create({
  //     data: registerRequest,
  //   });

  //   return toTailorResponse(tailor);
  // }

  static async login(request: LoginCustomerRequest): Promise<TailorResponse> {
    const loginRequest = Validation.validate(CustomerValidation.LOGIN, request);

    let tailor = await prismaClient.tailor.findUnique({
      where: {
        email: loginRequest.email,
      },
    });

    if (!tailor) {
      throw new ResponseError(401, "Email or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      tailor.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "Email or password is wrong");
    }

    tailor = await prismaClient.tailor.update({
      where: {
        email: loginRequest.email,
      },
      data: {
        token: uuid(),
      },
    });

    const response = toTailorResponse(tailor);
    response.token = tailor.token!;
    return response;
  }

  static async registerV2(
    request: CreateTailorRequest,
    profilePictureFile?: Express.Multer.File,
    certificateFiles?: Express.Multer.File[] // Tambahkan array file
  ): Promise<TailorResponse> {
    // Validasi request (opsional)
    const registerRequest = request;
  
    // Cek jika email sudah terdaftar
    const totalUserWithSameEmail = await prismaClient.tailor.count({
      where: {
        email: registerRequest.email,
      },
    });
  
    if (totalUserWithSameEmail !== 0) {
      throw new ResponseError(400, "Email already exist");
    }
  
    // Hash password
    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
  
    // Upload profile picture jika ada
    let profilePictureUrl: string | null = null;
    if (profilePictureFile) {
      const fileName = `profile-pictures/${uuid()}`;
      const { data, error } = await supabase.storage
        .from("profile") // Ganti dengan bucket storage Anda
        .upload(fileName, profilePictureFile.buffer, {
          contentType: profilePictureFile.mimetype,
        });
  
      if (error) {
        throw new ResponseError(500, "Failed to upload profile picture");
      }
  
      profilePictureUrl = data?.path
        ? `${supabase.storage.from("profile").getPublicUrl(data.path).data.publicUrl}`
        : null;
    }
  
    // Upload certificates jika ada
    let certificateUrls: string[] = [];
    if (certificateFiles && certificateFiles.length > 0) {
      for (const file of certificateFiles) {
        const fileName = `certificates/${uuid()}`;
        const { data, error } = await supabase.storage
          .from("certificates") // Ganti dengan bucket storage Anda
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });
  
        if (error) {
          throw new ResponseError(500, "Failed to upload certificate");
        }
  
        if (data?.path) {
          const publicUrl = `${supabase.storage
            .from("certificates")
            .getPublicUrl(data.path).data.publicUrl}`;
          certificateUrls.push(publicUrl); // Tambahkan URL ke array
        }
      }
    }
  
    // Set URLs ke request
    registerRequest.profilePicture = profilePictureUrl;
    registerRequest.certificate = certificateUrls;
  
    // Simpan ke database
    const tailor = await prismaClient.tailor.create({
      data: registerRequest,
    });
  
    return toTailorResponse(tailor);
  }
}
