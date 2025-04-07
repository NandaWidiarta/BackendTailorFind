import {Request, Response, NextFunction} from "express";
import { GeneralService } from "../service/general-service";
import { CustomerService } from "../service/customer-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
import { RegionService } from "../service/region-service";

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

  static async getProvinceV2(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await RegionService.getProvinces();
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}