import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { CreateCustomerRequest, CustomerResponse, CustomersResponse, LoginCustomerRequest, toCustomerResponse } from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid";
import { ChatResponse, DistrictResponse, ProvinceResponse, RegencyResponse, VillageResponse } from "../model/general-model";
import { supabase, supabaseAdmin } from "../supabase-client";
import { Role } from "@prisma/client";
import { toTailorResponse } from "../model/tailor-model";


export class GeneralService {
  static async getProvince(): Promise<ProvinceResponse[]> {
    const provinces = await prismaClient.province.findMany({});
    return provinces;
  }

  static async getRegency(provinceCode: string): Promise<RegencyResponse[]> {
    const regency = await prismaClient.regency.findMany({
      where: {
        province_code: provinceCode,
      },
    });

    if (!regency) {
      throw new ResponseError(404, "Regency Not Found");
    }

    return regency;
  }

  static async getDistrict(regencyCode: string): Promise<DistrictResponse[]> {
    const district = await prismaClient.district.findMany({
      where: {
        regency_code: regencyCode,
      },
    });

    if (!district) {
      throw new ResponseError(404, "District Not Found");
    }

    return district;
  }

  static async getVillage(districtCode: string): Promise<VillageResponse[]> {
    const village = await prismaClient.village.findMany({
      where: {
        district_code: districtCode,
      },
    });

    if (!village) {
      throw new ResponseError(404, "District Not Found");
    }

    return village;
  }

  static async logout(userId: string) {
    const user = await prismaClient.user.update({
      where: { id: userId },
      data: { token: null },
    });

    const { password, createdAt, ...filteredUser } = user;
    
    return filteredUser;
  }

  static async loginV2(request: LoginCustomerRequest) {
    const loginRequest = Validation.validate(CustomerValidation.LOGIN, request)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginRequest.email,
      password: loginRequest.password
    })
    
    if (authError) {
      throw new ResponseError(401, "Email or password is wrong")
    }
    
    if (!authData.user) {
      throw new ResponseError(401, "User not found")
    }
    
    const user = await prismaClient.user.findUnique({
      where: {
        email: loginRequest.email
      },
      include: {
        tailorProfile: true
      }
    })
    
    if (!user) {
      throw new ResponseError(401, "User not found")
    }
    
    if (user.role === Role.CUSTOMER || user.role === Role.ADMIN) {
      const response = toCustomerResponse(user)
      response.token = authData.session?.access_token || ''
      return response
    } else {
      const response = toTailorResponse(user)
      response.token = authData.session?.access_token || ''
      return response
    }
  }

  static async forgotPassword(email: string){
    const user = await prismaClient.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      throw new ResponseError(400, "user-not-found")
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://backend-tailor-find.vercel.app/testis"
    })
    
    if (error) {
      throw new ResponseError(500, "failed-to-send-password-reset-email")
    }

    return "Success Send Reset Password Link To Email"
  }

  static async resetPassword(newPassword: string, userId: string) {

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId, 
      { password: newPassword }
    );
    
    if (error) {
      throw new ResponseError(400, `Failed to reset password: ${error.message}`)
    }

    return "Success Reset Password"
  }

  static async logoutV2() {
    // const { data: { user } } = await supabase.auth.getUser()
    // console.log("Current user before logout:", user)

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new ResponseError(500, `Failed to logout: ${error.message}`);
    }
    
    return "Successfully logged out";
  }
}