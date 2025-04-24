import { Role } from "@prisma/client"
import { prismaClient } from "../application/database"
import { ResponseError } from "../error/response-error"
import { LoginRequest, toCustomerResponse } from "../model/customer-model"
import { toTailorResponse } from "../model/tailor-model"
import { supabase, supabaseAdmin } from "../supabase-client"
import { CustomerValidation } from "../validation/customer-validation"
import { Validation } from "../validation/validation"

export class AuthService {
    async loginV2(request: LoginRequest) {
        const loginRequest = Validation.validate(CustomerValidation.LOGIN, request)

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: loginRequest.email,
            password: loginRequest.password
        })

        if (authError) {
            throw new ResponseError(401, "Email atau password salah")
        }

        if (!authData.user) {
            throw new ResponseError(401, "User tidak ditemukan")
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
            throw new ResponseError(401, "User tidak ditemukan")
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
            redirectTo: "https://tailor-find.vercel.app/forget-password"
        })

        if (error) {
            throw new ResponseError(500, "failed-to-send-password-reset-email")
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
        );

        if (error) {
            throw new ResponseError(400, `Gagal reset password: ${error.message}`)
        }

        return "Gagal Reset Password"
    }


}