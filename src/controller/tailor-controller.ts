import {Request, Response, NextFunction} from "express";
import { CreateTailorRequest } from "../model/tailor-model";
import { TailorService } from "../service/tailor-service";
import { LoginCustomerRequest } from "../model/customer-model";

export class TailorController {
    // static async register(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const request: CreateTailorRequest = req.body as CreateTailorRequest;
    //         const response = await TailorService.register(request);
    //         res.status(200).json({
    //             data: response
    //         })
    //     } catch (e) {
    //         next(e);
    //     }
    // }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request: LoginCustomerRequest = req.body as LoginCustomerRequest;
            const response = await TailorService.login(request);
            res.status(200).json({
                data: response
            })
        } catch (e) {
            next(e);
        }
    }

    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: CreateTailorRequest = {
                ...req.body,
                specialization: JSON.parse(req.body.specialization || "[]"), // Pastikan specialization di-parse jadi array
            };
        
            // File profile picture
            const profilePictureFile = Array.isArray(req.files) ? undefined : req.files?.profilePicture?.[0];
        
            // File certificates
            const certificateFiles = Array.isArray(req.files) ? [] : req.files?.certificate || [];

        
            // Call service
            const response = await TailorService.registerV2(
                request,
                profilePictureFile,
                certificateFiles as Express.Multer.File[] // Cast ke array file
            );
        
            res.status(200).json({
                data: response,
            });
        } catch (e) {
          next(e);
        }
      }
    
}