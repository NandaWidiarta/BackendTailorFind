import { Response, NextFunction } from "express";
import { prismaClient } from "../application/database";
import { TailorRequest } from "../type/tailor-request";

export const authTailorMiddleware = async (req: TailorRequest, res: Response, next: NextFunction) => {
    const token = req.get('X-API-TOKEN')

    console.log("token tailor :", token)

    if (token) {
        const tailor = await prismaClient.tailor.findFirst({
            where: {
                token: token
            }
        })

        if (tailor) {
            req.tailor = tailor
            next()
            return
        }
    }

    res.status(401).json({
        errors: "Unauthorized"
    }).end()
}
