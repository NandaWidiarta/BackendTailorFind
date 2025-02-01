import { Customer } from "@prisma/client";

export type CustomerResponse = {
    id : number;
    firstName: string;
    lastName?: string;
    email: string;
    phoneNumber: string;
    token?: string;
}

export type CreateCustomerRequest = {
    firstname: string;
    lastname?: string | null;
    email: string;
    phoneNumber: string;
    password: string;
}

export type CustomersResponse = {
    firstname: string;
    lastname?: string | null;
    email: string;
    phoneNumber: string;
    password: string;
    token?: string | null;
}

export type LoginCustomerRequest = {
    email: string;
    password: string;
}

export type RatingReviewRequest = {
    rating: number;
    review?: string;
    tailorId: number;
    customerId: number;
}

export function toCustomerResponse(customer: Customer): CustomerResponse {
    return {
        id : customer.id,
        firstName: customer.firstname,
        lastName: customer.lastname || undefined,
        email: customer.email,
        phoneNumber: customer.phoneNumber
    }
}

