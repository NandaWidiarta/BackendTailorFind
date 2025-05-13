import { LocationService } from "../service/location-service";
import e, { Request, Response, NextFunction } from "express";
import { AuthService } from "../service/auth-service";
import { CreateCustomerRequest, LoginRequest } from "../model/customer-model";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
import { Role } from "@prisma/client";
import { CreateTailorRequest } from "../model/tailor-model";

export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    async registerCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            const request: CreateCustomerRequest = req.body as CreateCustomerRequest;
            const profilePicture = req.file
            console.log("registerv2", request)
            const response = await this.authService.registerCustomer(request, profilePicture);
            res.status(200).json({
                data: response,
            });
        } catch (e) {
            next(e)
        }
    }

    async registerTailor(req: Request, res: Response, next: NextFunction) {
        try {
            const request: CreateTailorRequest = {
                ...req.body,
                specialization: JSON.parse(req.body.specialization || "[]"), // Pastikan specialization di-parse jadi array
            }

            const profilePictureFile = Array.isArray(req.files)
                ? undefined
                : req.files?.profilePicture?.[0]

            const certificateFiles = Array.isArray(req.files)
                ? []
                : req.files?.certificate || []

            const response = await this.authService.registerTailor(
                request,
                profilePictureFile,
                certificateFiles as Express.Multer.File[]
            )

            res.status(200).json({
                data: response,
            });
        } catch (e) {
            next(e)
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request: LoginRequest = req.body as LoginRequest
            const response = await this.authService.login(request)
            res.status(200).json({
                data: response,
            })
        } catch (e) {
            next(e)
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body
            const response = await this.authService.forgotPassword(email);
            res.status(200).json({
                message: response,
            });
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { newPassword } = req.body;
            const userReq = req as UserRequest;
            const userId = userReq.user?.id;
            if (!userId) {
                throw new ResponseError(400, "User id kosong ");
            }
            const response = await this.authService.resetPassword(newPassword, userId);
            res.status(200).json({
                message: response,
            });
        } catch (e) {
            next(e);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await this.authService.logout();

            res.status(200).json({
                data: response,
            });
        } catch (e) {
            next(e);
        }
    }

    async getDetailUserLoggedIn(req: Request, res: Response, next: NextFunction) {
        const userReq = req as UserRequest;
        const userEmail = userReq.user?.email;
        if (!userEmail) {
            throw new ResponseError(400, "Terjadi Kesalahan");
        }
        const response = await this.authService.getDetailUserByEmail(userEmail);

        res.status(200).json({
            data: response,
        });
    }

    async getUserDetailById(req: Request, res: Response, next: NextFunction) {
        try {
            const userReq = req as UserRequest;
            const userId = userReq.user?.id;
            const userRole = userReq.user?.role;
            if (!userId && !userRole) {
                throw new ResponseError(400, "User Tidak Ditemukan");
            }

            const response = await this.authService.getUserDetailById(userId as string, userRole as Role);

            res.status(200).json({
                data: response,
            });
        } catch (e) {
            next(e);
        }
    }
}