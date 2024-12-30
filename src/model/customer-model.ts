import { Customer } from "@prisma/client";

export type CustomerResponse = {
    username: string;
    name: string;
    token?: string;
}

export type CreateCustomerRequest = {
    username: string;
    name: string;
    password: string;
}

export type CustomersResponse = {
    username: string;
    name: string;
    password: string;
    token?: string | null;
}

export function toCustomerResponse(customer: Customer): CustomerResponse {
    return {
        name: customer.name,
        username: customer.username
    }
}

