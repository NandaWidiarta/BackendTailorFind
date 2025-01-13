import {Request, Response, NextFunction} from "express";
import { CreateTailorRequest } from "../model/tailor-model";
import { TailorService } from "../service/tailor-service";
import { LoginCustomerRequest } from "../model/customer-model";

export class TailorController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: CreateTailorRequest = req.body as CreateTailorRequest;
            const response = await TailorService.register(request);
            res.status(200).json({
                data: response
            })
        } catch (e) {
            next(e);
        }
    }

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
}