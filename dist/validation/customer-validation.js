"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerValidation = void 0;
const zod_1 = require("zod");
class CustomerValidation {
}
exports.CustomerValidation = CustomerValidation;
CustomerValidation.REGISTER = zod_1.z.object({
    firstname: zod_1.z.string().min(1).max(100),
    lastname: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().min(1).max(100),
    password: zod_1.z.string().min(1).max(100),
    phoneNumber: zod_1.z.string().min(1).max(100)
});
CustomerValidation.LOGIN = zod_1.z.object({
    email: zod_1.z.string().min(1).max(100),
    password: zod_1.z.string().min(1).max(100)
});
