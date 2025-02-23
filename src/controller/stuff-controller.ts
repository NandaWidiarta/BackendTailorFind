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
}
