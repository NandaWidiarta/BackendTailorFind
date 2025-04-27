import { Role, User, Gender } from "@prisma/client";
import { ArticleResponse, mapToArticleResponse } from "./article-model";
import { CourseResponse, mapToCourseResponse } from "./course-model";
import { mapToStuffResponse, StuffResponse } from "./stuff-model";

export type CreateTailorRequest = {
  firstname: string
  lastname?: string | null
  gender: Gender
  email: string
  phoneNumber: string
  password: string
  provinceId: string
  regencyId: string
  districtId: string
  villageId: string
  addressDetail: string
  workEstimation: string
  priceRange: string
  specialization: string[]
  businessDescription: string
  profilePicture?: string | null
  certificate?: string[]
}

export type TailorResponse = {
  id: string
  firstname: string
  lastname?: string | null
  gender: Gender
  email: string
  phoneNumber: string
  provinceId: string | null
  regencyId: string | null
  districtId: string | null
  villageId: string | null
  addressDetail: string | null
  workEstimation: string | null
  priceRange: string | null
  specialization: string[]
  businessDescription: string | null
  profilePicture?: string | null
  role: Role
  certificate?: string[]
  createdAt: Date
  token?: string | null
}

export type StuffFilterParams = {
  page?: number;
  pageSize?: number;
  name?: string;
  stuffCategory?: string; 
  maxPrice?: number;
}

export interface TailorHomeResponse extends TailorResponse {
  averageRating: number| null
  provinceName?: string;
  regencyName?: string;
  districtName?: string;
  villageName?: string;
  unreadMessagesCount: number;
  latestArticles: ArticleResponse[];
  latestStuff: StuffResponse[]
  latestCourses: CourseResponse[]
}

export function toTailorResponse(
  user: User & { tailorProfile?: any }
): TailorResponse {

  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname ?? null,
    email: user.email,
    phoneNumber: user.phoneNumber,
    provinceId: user.tailorProfile?.provinceId ?? null,
    regencyId: user.tailorProfile?.regencyId ?? null,
    districtId: user.tailorProfile?.districtId ?? null,
    villageId: user.tailorProfile?.villageId ?? null,
    addressDetail: user.tailorProfile?.addressDetail ?? null,
    workEstimation: user.tailorProfile?.workEstimation ?? null,
    priceRange: user.tailorProfile?.priceRange ?? null,
    specialization: user.tailorProfile?.specialization ?? [],
    businessDescription: user.tailorProfile?.businessDescription ?? null,
    profilePicture: user.profilePicture ?? null,
    certificate: user.tailorProfile?.certificate ?? [],
    gender: user.tailorProfile.gender,
    role: user.role,
    createdAt: user.createdAt,
    token: user.token ?? null,
  }
}


export function toTailorHomeResponse(tailor: any, unread: any, article: any, stuff: any, course: any): TailorHomeResponse {
  return {
    id: tailor.userId,
    averageRating: tailor.averageRating,
    firstname: tailor.user?.firstname || "",
    lastname: tailor.user?.lastname || "",
    email: tailor.user?.email || "",
    phoneNumber: tailor.user?.phoneNumber || "",
    profilePicture: tailor.user?.profilePicture ?? null,
    role: tailor.user?.role ?? "TAILOR",
    createdAt: tailor.user?.createdAt ?? new Date(),

    gender: tailor.gender,
    provinceId: tailor.provinceId ?? null,
    regencyId: tailor.regencyId ?? null,
    districtId: tailor.districtId ?? null,
    villageId: tailor.villageId ?? null,
    addressDetail: tailor.addressDetail ?? null,
    workEstimation: tailor.workEstimation ?? null,
    priceRange: tailor.priceRange ?? null,
    specialization: tailor.specialization ?? [],
    businessDescription: tailor.businessDescription ?? null,
    certificate: tailor.certificate ?? [],
    token: tailor.user?.token ?? null,

    provinceName: tailor.province?.name ?? undefined,
    regencyName: tailor.regency?.name ?? undefined,
    districtName: tailor.district?.name ?? undefined,
    villageName: tailor.village?.name ?? undefined,
    unreadMessagesCount: unread,

    latestArticles: (article || []).map(mapToArticleResponse),
    latestCourses: (stuff || []).map(mapToCourseResponse),
    latestStuff: (course || []).map(mapToStuffResponse),
  };
}
