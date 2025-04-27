import e, {Request, Response, NextFunction} from "express";
import { GeneralService } from "../service/general-service";
import { CustomerService } from "../service/customer-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
import { Role } from "@prisma/client";

export class GeneralController {

  static async getUserDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      const userRole = userReq.user?.role;
      if (!userId && !userRole) {
        throw new ResponseError(400, "User Tidak Ditemukan");
      }

      const response = await GeneralService.getUserDetail(userId as string, userRole as Role);

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
  static async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "User Tidak Ditemukan");
      }

      const { balance } = req.body

      const response = await GeneralService.withdraw(userId as string, balance as number);

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(e)
    }
  }
}