import { Role, User } from "@prisma/client";

export type CreateTailorRequest = {
  firstname: string
  lastname?: string | null
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
};

export type TailorResponse = {
  id: string
  firstname: string
  lastname?: string | null
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
};

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
    profilePicture: user.tailorProfile?.profilePicture ?? null,
    certificate: user.tailorProfile?.certificate ?? [],

    role: user.role,
    createdAt: user.createdAt,
    token: user.token ?? null,
  };
}
