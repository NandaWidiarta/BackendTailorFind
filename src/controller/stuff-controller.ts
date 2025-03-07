import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error";
import { UserRequest } from "../type/user-request";
import { StuffService } from "../service/stuff-service";

export class StuffController {
  static async addStuff(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ResponseError(500, "image-not-found");
      }

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id

      if (!tailorId) {
        throw new ResponseError(400, "Invalid-user-information");
      }

      const {
        stuffName,
        price,
        stuffCategory,
      } = req.body

      const priceParsed = parseInt(price)

      const response = await StuffService.addStuff(
        tailorId,
        stuffName,
        priceParsed,
        stuffCategory,
        req.file
      )

      res.status(200).json({
        response,
      })
    } catch (e) {
      next(e);
    }
  }

  static async updateStuff(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const stuffId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Invalid-user-information");
      }
      
      const {
        name,
        price,
        stuffCategory
      } = req.body

      const priceParsed = parseInt(price)

      const response = await StuffService.updateStuff(
        stuffId,
        tailorId,
        name,
        priceParsed,
        stuffCategory,
        req.file
      )

      res.status(200).json({
        data: response,
      })
    } catch (e) {
      next(e);
    }
  }

  static async deleteStuff(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const stuffId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Invalid-user-information");
      }
      
      const response = await StuffService.deleteStuff(stuffId, tailorId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
