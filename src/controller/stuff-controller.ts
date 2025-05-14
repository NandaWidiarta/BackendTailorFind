import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error";
import { UserRequest } from "../type/user-request";
import { StuffService } from "../service/stuff-service";

export class StuffController {
  constructor(
    private readonly stuffService: StuffService
) { }
  async addStuff(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ResponseError(500, "Gambar tidak ditemukan");
      }

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }

      const {
        stuffName,
        price,
        stuffCategory,
      } = req.body

      const priceParsed = parseInt(price)

      const response = await this.stuffService.addStuff(
        tailorId,
        stuffName,
        priceParsed,
        stuffCategory,
        req.file
      )

      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async updateStuff(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const stuffId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }
      
      const {
        name,
        price,
        stuffCategory
      } = req.body

      const priceParsed = parseInt(price)

      const response = await this.stuffService.updateStuff(
        stuffId,
        tailorId,
        name,
        priceParsed,
        stuffCategory,
        req.file
      )

      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async deleteStuff(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const stuffId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }
      
      const response = await this.stuffService.deleteStuff(stuffId, tailorId)
    
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
}
