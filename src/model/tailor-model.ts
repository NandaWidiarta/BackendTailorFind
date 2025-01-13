import { Tailor } from "@prisma/client";

export type CreateTailorRequest = {
    firstname: string;
    lastname?: string | null;
    email: string;
    phoneNumber: string;
    password: string;
    provinceId: string;
    regencyId: string;
    districtId: string;
    villageId: string;
    addressDetail: string;
    workEstimation: string;
    priceRange: string;
    specialization: string[];
    businessDescription: string;
    profilePicture?: string | null;
    certificate?: string | null;
  };
  
  export type TailorResponse = {
    id: number;
    firstname: string;
    lastname?: string | null;
    email: string;
    phoneNumber: string;
    provinceId: string;
    regencyId: string;
    districtId: string;
    villageId: string;
    addressDetail: string;
    workEstimation: string;
    priceRange: string;
    specialization: string[];
    businessDescription: string;
    profilePicture?: string | null;
    certificate?: string | null;
    createdAt: Date;
    token?: string | null;
  };

  export function toTailorResponse(tailor: Tailor): TailorResponse {
    return {
      id: tailor.id, // Assuming 'id' exists in the 'Tailor' object
      firstname: tailor.firstname,
      lastname: tailor.lastname || null, // Use null for optional fields if no value is provided
      email: tailor.email,
      phoneNumber: tailor.phoneNumber,
      provinceId: tailor.provinceId,
      regencyId: tailor.regencyId,
      districtId: tailor.districtId,
      villageId: tailor.villageId,
      addressDetail: tailor.addressDetail,
      workEstimation: tailor.workEstimation,
      priceRange: tailor.priceRange,
      specialization: tailor.specialization, // Assumes specialization is an array in 'Tailor'
      businessDescription: tailor.businessDescription,
      profilePicture: tailor.profilePicture || null,
      certificate: tailor.certificate || null,
      createdAt: tailor.createdAt,
      token: tailor.token || null // Handle optional token field
    };
  }
  