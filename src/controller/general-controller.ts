import e, {Request, Response, NextFunction} from "express";
import { GeneralService } from "../service/general-service";
import { CustomerService } from "../service/customer-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
import { LoginCustomerRequest } from "../model/customer-model";
import { Role } from "@prisma/client";
import { ChatService } from "../service/chat-service";

export class GeneralController {
  static async getProvince(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await GeneralService.getProvince();
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getRegency(req: Request, res: Response, next: NextFunction) {
    try {
      const provinceCode = req.params.provinceCode;
      const response = await GeneralService.getRegency(provinceCode);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getDistrict(req: Request, res: Response, next: NextFunction) {
    try {
      const regencyCode = req.params.regencyCode;
      const response = await GeneralService.getDistrict(regencyCode);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getVillage(req: Request, res: Response, next: NextFunction) {
    try {
      const districtCode = req.params.districtCode;
      const response = await GeneralService.getVillage(districtCode);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getHomeData(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await CustomerService.getHomeData();
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "user-id-null");
      }

      const response = await GeneralService.logout(userId);

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async loginV2(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginCustomerRequest = req.body as LoginCustomerRequest;
      const response = await GeneralService.loginV2(request);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    } 
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      // const userReq = req as UserRequest;
      // const email = userReq.user?.email;
      // if (!email) {
      //   throw new ResponseError(400, "email-null");
      // }

      const { email } = req.body
      const response = await GeneralService.forgotPassword(email);
      res.status(200).json({
        message: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword } = req.body;
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "user-id-null");
      }
      const response = await GeneralService.resetPassword(newPassword, userId);
      res.status(200).json({
        message: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async logoutV2(req: Request, res: Response, next: NextFunction) {
    try {
      // const userReq = req as UserRequest;
      // const userId = userReq.user?.id;
      // if (!userId) {
      //   throw new ResponseError(400, "user-id-null");
      // }

      const response = await GeneralService.logoutV2();

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

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