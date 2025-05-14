import { Request, Response, NextFunction } from "express";
import { CreateTailorRequest } from "../model/tailor-model";
import { TailorService } from "../service/tailor-service";
import { LoginRequest } from "../model/customer-model";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";

export class TailorController {
  constructor(
    private readonly tailorService: TailorService
  ) { }

  async getHomeData(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id
      if (!userId) {
        throw new ResponseError(400, "User id kosong")
      }

      const result = await this.tailorService.getHomeData(userId)
      res.status(200).json(result)
    } catch (e) {
      next(e)
    }
  }

  async getStuff(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1" } = req.query
      const currentPage = parseInt(page as string, 10) || 1
      const userReq = req as UserRequest
      const userId = userReq.user?.id
      if (!userId) {
        throw new ResponseError(400, "User id kosong")
      }
      
      const response = await this.tailorService.getStuff(currentPage, 8, userId)
    
      res.status(200).json(response)
    } catch (e) {
      next(e)
    }
  }

  async getFilteredStuff(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, stuffCategory, maxPrice, page = "1" } = req.query

      const currentPage = parseInt(page as string, 10) || 1
      const userReq = req as UserRequest
      const userId = userReq.user?.id
      const max = maxPrice ? parseInt(maxPrice as string, 10) : undefined

      if (!userId) {
        throw new ResponseError(400, "User id kosong")
      }

      const result = await this.tailorService.filterStuff({
        page: currentPage,
        pageSize: 8, 
        name: name as string,
        stuffCategory: stuffCategory as string,
        maxPrice: max,
      }, userId)
    
      res.status(200).json({
        data: result.data,
        meta: result.meta
      })
    } catch (e) {
      next(e)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {

      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Informasi user tidak valid")
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
      } = req.body

      const updateData: any = {}
      
      if (firstname !== undefined) updateData.firstname = firstname
      if (lastname !== undefined) updateData.lastname = lastname
      if (email !== undefined) updateData.email = email
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
      
      if (provinceId !== undefined) updateData.provinceId = provinceId
      if (regencyId !== undefined) updateData.regencyId = regencyId
      if (districtId !== undefined) updateData.districtId = districtId
      if (villageId !== undefined) updateData.villageId = villageId
      if (addressDetail !== undefined) updateData.addressDetail = addressDetail
      if (workEstimation !== undefined) updateData.workEstimation = workEstimation
      if (priceRange !== undefined) updateData.priceRange = priceRange
      if (specialization !== undefined) {
        updateData.specialization = typeof specialization === 'string' 
          ? JSON.parse(specialization) 
          : specialization
      }
      if (businessDescription !== undefined) updateData.businessDescription = businessDescription
      
      const result = await this.tailorService.updateTailorProfile(
        userId,
        updateData,
        req.file
      )

      res.status(200).json(result)
    } catch (e) {
      next(e)
    }
  }

  async addCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Informasi user tidak valid")
      }

      const certificateFiles = Array.isArray(req.files)
        ? []
        : req.files?.certificate || []

      const response = await this.tailorService.addCertificates(
        userId,
        certificateFiles as Express.Multer.File[] 
      )

      res.status(200).json(response)
    } catch (e) {
      next(e)
    }
  }

  async getCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Informasi user tidak valid")
      }

      const response = await this.tailorService.getCertificates(
        userId
      )

      res.status(200).json(response)
    } catch (e) {
      next(e)
    }
  }

  async deleteCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id

      if (!userId) {
        throw new ResponseError(400, "Informasi user tidak valid")
      }

      const {
        certificateUrl
      } = req.body

      const response = await this.tailorService.deleteCertificate(
        userId,
        certificateUrl
      )

      res.status(200).json(response)
    } catch (e) {
      next(e)
    }
  }

  async getReviewData(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const userId = userReq.user?.id
      if (!userId) {
        throw new ResponseError(400, "User id kosong")
      }

      const result = await this.tailorService.getReviewData(userId)
      res.status(200).json(result)
    } catch (e) {
      next(e)
    }
  }

}
