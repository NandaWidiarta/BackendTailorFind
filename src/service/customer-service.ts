import { Customer } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { CreateCustomerRequest, CustomerResponse, CustomersResponse, toCustomerResponse } from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid";
import { CustomerRequest } from "../type/user-request";

export class CustomerService {
    static async register(request: CreateCustomerRequest): Promise<CustomerResponse> {
        const registerRequest = Validation.validate(CustomerValidation.REGISTER, request);

        const totalUserWithSameUsername = await prismaClient.customer.count({
            where: {
                username: registerRequest.username
            }
        });

        if(totalUserWithSameUsername != 0){
            throw new ResponseError(400, "Username already exist");
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const customer = await prismaClient.customer.create({
            data: registerRequest
        });

        return toCustomerResponse(customer);
    }

    static async getCustomers() : Promise<CreateCustomerRequest[]> {
        const users = await prismaClient.customer.findMany({})
        if(!users){
            throw new ResponseError(401, "Username or password is wrong")
        }
        console.log(users)
        return users
    }

    static async get(customer: Customer): Promise<CustomerResponse> {
        return toCustomerResponse(customer)
    }
}