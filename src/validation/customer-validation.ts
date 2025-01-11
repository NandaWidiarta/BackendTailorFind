import {z, ZodType} from "zod";

export class CustomerValidation {

    static readonly REGISTER: ZodType = z.object({
        firstname: z.string().min(1).max(100),
        lastname: z.string().min(1).max(100),
        email: z.string().min(1).max(100),
        password: z.string().min(1).max(100),
        phoneNumber: z.string().min(1).max(100)
    });
    
    static readonly LOGIN: ZodType = z.object({
        email: z.string().min(1).max(100),
        password: z.string().min(1).max(100)
    });
}