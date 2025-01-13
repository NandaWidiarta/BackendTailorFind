import { Customer } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { CreateCustomerRequest, CustomerResponse, CustomersResponse, LoginCustomerRequest, toCustomerResponse } from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid";
import { CustomerRequest } from "../type/user-request";
import { CreateTailorRequest, TailorResponse, toTailorResponse } from "../model/tailor-model";

export class TailorService {
    static async register(request: CreateTailorRequest): Promise<TailorResponse> {
        // const registerRequest = Validation.validate(CustomerValidation.REGISTER, request);
        const registerRequest = request;

        const totalUserWithSameEmail = await prismaClient.tailor.count({
            where: {
                email: registerRequest.email
            }
        });

        if(totalUserWithSameEmail != 0){
            throw new ResponseError(400, "Email already exist");
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const tailor = await prismaClient.tailor.create({
            data: registerRequest
        });

        return toTailorResponse(tailor);
    }

    static async login(request: LoginCustomerRequest): Promise<TailorResponse> {
        const loginRequest = Validation.validate(CustomerValidation.LOGIN, request);

        let tailor = await prismaClient.tailor.findUnique({
            where: {
                email: loginRequest.email
            }
        })

        if(!tailor){
            throw new ResponseError(401, "Email or password is wrong")
        }

        const isPasswordValid = await bcrypt.compare(loginRequest.password, tailor.password)
        if (!isPasswordValid) {
            throw new ResponseError(401, "Email or password is wrong");
        }

        tailor = await prismaClient.tailor.update({
            where : {
                email: loginRequest.email
            },
            data : {
                token: uuid()
            }
        })

        const response = toTailorResponse(tailor)
        response.token = tailor.token!
        return response
    }

}