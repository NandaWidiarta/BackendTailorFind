import { Request, Response, NextFunction } from "express";
import { CreateTailorRequest } from "../model/tailor-model";
import { TailorService } from "../service/tailor-service";
import { LoginCustomerRequest } from "../model/customer-model";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";

export class TailorController {
  static async login(req: Request, res: Response, next: NextFunction) {
      try {
          const request: LoginCustomerRequest = req.body as LoginCustomerRequest
          const response = await TailorService.login(request)
          res.status(200).json({
              data: response
          })
      } catch (e) {
          next(e)
      }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateTailorRequest = {
        ...req.body,
        specialization: JSON.parse(req.body.specialization || "[]"), // Pastikan specialization di-parse jadi array
      }

      const profilePictureFile = Array.isArray(req.files)
        ? undefined
        : req.files?.profilePicture?.[0]

      const certificateFiles = Array.isArray(req.files)
        ? []
        : req.files?.certificate || []

      const response = await TailorService.register(
        request,
        profilePictureFile,
        certificateFiles as Express.Multer.File[] // Cast ke array file
      )

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  static async getHomeData(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "user id null");
      }

      const result = await TailorService.getHomeData(userId);
      res.status(200).json({
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getStuff(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1" } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "user id null");
      }
      
      const response = await TailorService.getStuff(currentPage, 8, userId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getFilteredStuff(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, stuffCategory, maxPrice, page = "1" } = req.query;

      const currentPage = parseInt(page as string, 10) || 1;
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      const max = maxPrice ? parseInt(maxPrice as string, 10) : undefined;

      if (!userId) {
        throw new ResponseError(400, "user id null");
      }

      const result = await TailorService.filterStuff({
        page: currentPage,
        pageSize: 8, 
        name: name as string,
        stuffCategory: stuffCategory as string,
        maxPrice: max,
      }, userId);
    
      res.status(200).json({
        data: result.data,
        meta: result.meta
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {

      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Invalid-user-information");
      }

      const {
        firstname,
        lastname,
        email,
        phoneNumber,
        provinceId,
        regencyId,
        districtId,
        villageId,
        addressDetail,
        workEstimation,
        priceRange,
        specialization,
        businessDescription
      } = req.body;

      const updateData: any = {};
      
      // Data user
      if (firstname !== undefined) updateData.firstname = firstname;
      if (lastname !== undefined) updateData.lastname = lastname;
      if (email !== undefined) updateData.email = email;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      
      // Data tailor profile
      if (provinceId !== undefined) updateData.provinceId = provinceId;
      if (regencyId !== undefined) updateData.regencyId = regencyId;
      if (districtId !== undefined) updateData.districtId = districtId;
      if (villageId !== undefined) updateData.villageId = villageId;
      if (addressDetail !== undefined) updateData.addressDetail = addressDetail;
      if (workEstimation !== undefined) updateData.workEstimation = workEstimation;
      if (priceRange !== undefined) updateData.priceRange = priceRange;
      if (specialization !== undefined) {
        updateData.specialization = typeof specialization === 'string' 
          ? JSON.parse(specialization) 
          : specialization;
      }
      if (businessDescription !== undefined) updateData.businessDescription = businessDescription;
      
      const result = await TailorService.updateTailorProfile(
        userId,
        updateData,
        req.file
      );

      res.status(200).json({
        data: result,
      });
    } catch (e) {
      next(e)
    }
  }

  static async addCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Invalid-user-information");
      }

      const certificateFiles = Array.isArray(req.files)
        ? []
        : req.files?.certificate || []

      const response = await TailorService.addCertificates(
        userId,
        certificateFiles as Express.Multer.File[] 
      )

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  static async getCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Invalid-user-information");
      }

      const response = await TailorService.getCertificates(
        userId
      )

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  static async deleteCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Invalid-user-information");
      }

      const {
        certificateUrl
      } = req.body;

      const response = await TailorService.deleteCertificate(
        userId,
        certificateUrl
      )

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  static async registerV2(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateTailorRequest = {
        ...req.body,
        specialization: JSON.parse(req.body.specialization || "[]"), // Pastikan specialization di-parse jadi array
      }

      const profilePictureFile = Array.isArray(req.files)
        ? undefined
        : req.files?.profilePicture?.[0]

      const certificateFiles = Array.isArray(req.files)
        ? []
        : req.files?.certificate || []

      const response = await TailorService.registerV2(
        request,
        profilePictureFile,
        certificateFiles as Express.Multer.File[] // Cast ke array file
      )

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

}
