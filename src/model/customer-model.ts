import { Role, User, Gender } from "@prisma/client";

export type CustomerResponse = {
    id: string
    firstName: string
    lastName?: string
    email: string
    phoneNumber: string
    role: Role
    token?: string
    profilePicture: string | null
}

export type CreateCustomerRequest = {
    firstname: string
    lastname?: string | null
    email: string
    phoneNumber: string
    password: string
    role: Role
    token?: string | null
    profilePicture: string | null
}

export type CustomersResponse = {
    firstname: string
    lastname?: string | null
    email: string
    phoneNumber: string
    password: string
    token?: string | null
}

export type LoginRequest = {
    email: string
    password: string
}

export type RatingReviewRequest = {
    rating: number
    review?: string
    tailorId: string
    customerId: string
}

export interface TailorFilterParams {
    page?: number
    pageSize?: number
    search?: string
    provinceId?: string
    regencyId?: string
    districtId?: string
    villageId?: string
    specialization?: string
    averageRating?: string
    workEstimation?: string
    priceRange?: string
    gender?: Gender
}

export interface TailorHomeResponse {
    id: string
    firstname: string
    lastname: string | null
    addressDetail: string
    workEstimation: string
    priceRange: string
    specialization: string[]
    businessDescription: string
    profilePicture: string | null
    certificate: string[]
    averageRating: number
    gender: Gender
    provinceName: string
    regencyName: string
    districtName: string
    villageName: string
}

export interface UpdateCustomerProfileResponse {
    firstname?: string
    lastname?: string | null
    email?: string
    phoneNumber?: string
    profilePicture?: string | null
}


export function mapTailorProfileResponse(tailor: any): TailorHomeResponse {
    return {
        id: tailor.user.id,
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
    }
}
export function toCustomerResponse(customer: User): CustomerResponse {
    return {
        id: customer.id,
        firstName: customer.firstname,
        lastName: customer.lastname || undefined,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        profilePicture: customer.profilePicture,
        role: customer.role
    }
}

export function mapUserToProfileResponse(user: User): UpdateCustomerProfileResponse {
    return {
      firstname: user.firstname,
      lastname: user.lastname || null,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
    }
  }

  export function mapTailorFromUser(user: any): TailorHomeResponse {
    const profile = user.tailorProfile

    return {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname || null,
        addressDetail: profile.addressDetail,
        workEstimation: profile.workEstimation,
        priceRange: profile.priceRange,
        specialization: profile.specialization || [],
        businessDescription: profile.businessDescription,
        profilePicture: user.profilePicture || null,
        certificate: profile.certificate || [],
        averageRating: profile.averageRating,
        gender: profile.gender,
        provinceName: profile.province?.name || '',
        regencyName: profile.regency?.name || '',
        districtName: profile.district?.name || '',
        villageName: profile.village?.name || '',
    }
}
