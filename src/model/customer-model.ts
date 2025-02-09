import { Role, User } from "@prisma/client";

export type CustomerResponse = {
    id : string;
    firstName: string;
    lastName?: string;
    email: string;
    phoneNumber: string;
    role: Role;
    token?: string;
}

export type CreateCustomerRequest = {
    firstname: string;
    lastname?: string | null;
    email: string;
    phoneNumber: string;
    password: string;
    role: Role;
    token?: string | null;
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
    tailorId: string;
    customerId: string;
}

export function toCustomerResponse(customer: User): CustomerResponse {
    return {
        id : customer.id,
        firstName: customer.firstname,
        lastName: customer.lastname || undefined,
        email: customer.email,
        phoneNumber: customer.phoneNumber, 
        role: Role.CUSTOMER,
        token: customer.token || undefined
    }
}

