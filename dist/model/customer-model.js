"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCustomerResponse = toCustomerResponse;
function toCustomerResponse(customer) {
    return {
        firstName: customer.firstname,
        lastName: customer.lastname || undefined,
        email: customer.email,
        phoneNumber: customer.phoneNumber
    };
}
