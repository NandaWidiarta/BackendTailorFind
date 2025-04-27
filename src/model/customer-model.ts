import { Role, User, Gender } from "@prisma/client";

export type CustomerResponse = {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phoneNumber: string;
    role: Role;
    token?: string;
    profilePicture: string | null
}

export type CreateCustomerRequest = {
    firstname: string;
    lastname?: string | null;
    email: string;
    phoneNumber: string;
    password: string;
    role: Role;
    token?: string | null;
    profilePicture: string | null
}

export type CustomersResponse = {
    firstname: string;
    lastname?: string | null;
    email: string;
    phoneNumber: string;
    password: string;
    token?: string | null;
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type RatingReviewRequest = {
    rating: number;
    review?: string;
    tailorId: string;
    customerId: string;
}

export interface TailorFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    provinceId?: string;
    regencyId?: string;
    districtId?: string;
    villageId?: string;
    specialization?: string;
    averageRating?: string;
    workEstimation?: string;
    priceRange?: string;
    gender?: Gender
}

export interface TailorHomeResponse {
    id: string;
    userId: string;
    firstname: string;
    lastname: string;
    addressDetail: string;
    workEstimation: string;
    priceRange: string;
    specialization: string[];
    businessDescription: string;
    profilePicture: string | null;
    certificate: string[];
    averageRating: number;
    gender: Gender;
    provinceName: string;
    regencyName: string;
    districtName: string;
    villageName: string;
}

export interface UpdateCustomerProfileResponse {
    firstname?: string;
    lastname?: string | null;
    email?: string;
    phoneNumber?: string;
    profilePicture?: string | null;
}


export function mapTailorProfileResponse(tailor: any): TailorHomeResponse {
    return {
        id: tailor.id,
        userId: tailor.userId,
        firstname: tailor.user.firstname,
        lastname: tailor.user.lastname,
        addressDetail: tailor.addressDetail,
        workEstimation: tailor.workEstimation,
        priceRange: tailor.priceRange,
        specialization: tailor.specialization,
        businessDescription: tailor.businessDescription,
        profilePicture: tailor.user.profilePicture,
        certificate: tailor.certificate,
        averageRating: tailor.averageRating,
        gender: tailor.gender,
        provinceName: tailor.province.name,
        regencyName: tailor.regency.name,
        districtName: tailor.district.name,
        villageName: tailor.village.name,
    };
}
export function toCustomerResponse(customer: User): CustomerResponse {
    return {
        id: customer.id,
        firstName: customer.firstname,
        lastName: customer.lastname || undefined,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        profilePicture: customer.profilePicture,
        role: customer.role,
        token: customer.token || undefined
    }
}

export function mapUserToProfileResponse(user: User): UpdateCustomerProfileResponse {
    return {
      firstname: user.firstname,
      lastname: user.lastname || null,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
    };
  }

