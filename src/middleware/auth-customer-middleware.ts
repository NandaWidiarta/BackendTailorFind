// import { Response, NextFunction } from "express";
// import { prismaClient } from "../application/database";
// import { CustomerRequest } from "../type/customer-request";

// export const authCustomerMiddleware = async (req: CustomerRequest, res: Response, next: NextFunction) => {
//     const token = req.get('X-API-TOKEN')

//     console.log("token customer :", token)

//     if (token) {
//         const customer = await prismaClient.customer.findFirst({
//             where: {
//                 token: token
//             }
//         })

//         if (customer) {
//             req.customer = customer
//             next()
//             return
//         }
//     }

//     res.status(401).json({
//         errors: "Unauthorized"
//     }).end()
// }
