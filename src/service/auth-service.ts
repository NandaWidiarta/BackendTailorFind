import { Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { CreateCustomerRequest, CustomerResponse, LoginRequest, toCustomerResponse } from "../dto/customer-dto";
import { CreateTailorRequest, TailorResponse, toTailorResponse } from "../dto/tailor-dto";
import { supabase, supabaseAdmin } from "../supabase-client";

export class AuthService {
    async registerCustomer(registerRequest: CreateCustomerRequest, profilePictureFile?: Express.Multer.File): Promise<CustomerResponse> {
        const email = registerRequest.email.toLowerCase()

        const emailExists = await prismaClient.user.count({
            where: { email: email }
        }) > 0

        if (emailExists) {
            throw new ResponseError(400, "Email sudah digunakan")
        }

        let profilePictureUrl: string | null = null
        if (profilePictureFile) {
            const fileName = `${email}-${Date.now()}`
            const { data, error } = await supabase.storage
                .from("profile")
                .upload(fileName, profilePictureFile.buffer, {
                    contentType: profilePictureFile.mimetype,
                })

            if (error) {
                throw new ResponseError(500, "Gagal mengupload gambar ke server")
            }

            profilePictureUrl = data?.path
                ? `${supabase.storage.from("profile").getPublicUrl(data.path).data
                    .publicUrl
                }`
                : null
        } else {
            profilePictureUrl = "https://xtyrxekcsaesyyopouhh.supabase.co/storage/v1/object/public/profile/tes/user.png"
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: registerRequest.password
        })

        if (authError) {
            throw new ResponseError(400, authError.message)
        }

        if (!authData.user) {
            throw new ResponseError(500, "Gagal membuat user")
        }

        const customer = await prismaClient.user.create({
            data: {
                id: authData.user.id,
                firstname: registerRequest.firstname,
                lastname: registerRequest.lastname,
                email: email,
                phoneNumber: registerRequest.phoneNumber,
                role: Role.CUSTOMER,
                profilePicture: profilePictureUrl
            }
        })

        const response = toCustomerResponse(customer)
        response.token = authData.session?.access_token || ''
        return response
    }

    async registerTailor(
        request: CreateTailorRequest,
        profilePictureFile?: Express.Multer.File,
        certificateFiles?: Express.Multer.File[]
    ): Promise<TailorResponse> {
        const registerRequest = request

        const email = registerRequest.email.toLowerCase()

        const isEmailExist = await prismaClient.user.count({
            where: { email: email },
        })

        if (isEmailExist > 0) {
            throw new ResponseError(400, "Email sudah digunakan")
        }

        let profilePictureUrl: string | null = null
        if (profilePictureFile) {
            const fileName = `${email}-${Date.now()}`
            const { data, error } = await supabase.storage
                .from("profile")
                .upload(fileName, profilePictureFile.buffer, {
                    contentType: profilePictureFile.mimetype,
                })

            if (error) {
                throw new ResponseError(500, "Gagal mengupload gambar ke server")
            }

            profilePictureUrl = data?.path
                ? `${supabase.storage.from("profile").getPublicUrl(data.path).data
                    .publicUrl
                }`
                : null
        }

        let certificateUrls: string[] = []
        if (certificateFiles && certificateFiles.length > 0) {
            for (const file of certificateFiles) {
                const fileName = `${email}-${Date.now()}`
                const { data, error } = await supabase.storage
                    .from("certificates")
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                    })

                if (error) {
                    throw new ResponseError(500, "Gagal mengupload sertifikat ke server")
                }

                if (data?.path) {
                    const publicUrl = `${supabase.storage.from("certificates").getPublicUrl(data.path).data
                        .publicUrl
                        }`
                    certificateUrls.push(publicUrl)
                }
            }
        }

        registerRequest.profilePicture = profilePictureUrl
        registerRequest.certificate = certificateUrls

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: registerRequest.password
        })

        if (authError) {
            throw new ResponseError(400, authError.message)
        }

        if (!authData.user) {
            throw new ResponseError(500, "Gagal membuat user")
        }

        const tailor = await prismaClient.user.create({
            data: {
                id: authData.user.id,
                firstname: registerRequest.firstname,
                lastname: registerRequest.lastname,
                email: email,
                phoneNumber: registerRequest.phoneNumber,
                role: Role.TAILOR,
                profilePicture: registerRequest.profilePicture,
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
                        certificate: registerRequest.certificate,
                    },
                },
            },
            include: {
                tailorProfile: true,
            },
        })

        const response = toTailorResponse(tailor)
        response.token = authData.session?.access_token || ''
        return response
    }

    async login(request: LoginRequest) {

        const email = request.email.toLowerCase()

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: request.password
        })

        if (authError) {
            throw new ResponseError(400, "Email atau password salah")
        }

        if (!authData.user) {
            throw new ResponseError(400, "User tidak ditemukan")
        }

        const user = await prismaClient.user.findUnique({
            where: {
                email: email
            },
            include: {
                tailorProfile: true
            }
        })

        if (!user) {
            throw new ResponseError(400, "User tidak ditemukan")
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

    async forgotPassword(email: string) {
        const user = await prismaClient.user.findUnique({
            where: { email }
        })

        if (!user) {
            throw new ResponseError(400, "User tidak ditemukan")
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://www.tailorfind.site/forget-password"
        })

        if (error) {
            throw new ResponseError(500, "Gagal mengirim link reset password ke email")
        }

        return "Success Mengirim Link Reset Password ke Email"
    }

    async logout() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            throw new ResponseError(500, `Gagal logout: ${error.message}`)
        }

        return "Sukses logout"
    }

    async resetPassword(newPassword: string, userId: string) {

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        )

        if (error) {
            throw new ResponseError(400, `Gagal reset password: ${error.message}`)
        }

        return "Gagal Reset Password"
    }

    async getDetailUserByEmail(email: string) {
        const user = await prismaClient.user.findUnique({
            where: {
                email: email
            },
            include: {
                tailorProfile: true
            }
        })

        if (!user) {
            throw new ResponseError(400, "User tidak ditemukan")
        }

        if (user.role === Role.CUSTOMER || user.role === Role.ADMIN) {
            return toCustomerResponse(user)
        } else {
            return toTailorResponse(user)
        }
    }

    async getUserDetailById(userId: string, userRole: Role) {
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            include: {
                tailorProfile: userRole == Role.TAILOR
            }
        })

        if (user) {
            const { walletBalance, ...rest } = user
            return {
                ...rest,
                walletBalance: walletBalance.toString(),
            }
        }

        return null
    }

}