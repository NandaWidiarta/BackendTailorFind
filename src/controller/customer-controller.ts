import {Request, Response, NextFunction} from "express";
import { CreateCustomerRequest} from "../model/customer-model";
import { CustomerService } from "../service/customer-service";
import { CustomerRequest } from "../type/user-request";

export class CustomerController {

    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: CreateCustomerRequest = req.body as CreateCustomerRequest;
            const response = await CustomerService.register(request);
            res.status(200).json({
                data: response
            })
        } catch (e) {
            next(e);
        }
    }

    static async tes(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json({
                message: "test"
            })
        } catch (e) {
            next(e);
        }
    }


    static async getCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await CustomerService.getCustomers();
            res.status(200).json({
                data: response
            })
        } catch (e) {
            next(e);
        }
    }

    static async get(req: CustomerRequest, res: Response, next: NextFunction) {
        try {
            const response = await CustomerService.get(req.customer!);
            res.status(200).json({
                data: response
            })
        } catch (e) {
            next(e);
        }
    }

}