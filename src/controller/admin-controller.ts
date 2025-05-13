import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error";
import { OrderService } from "../service/order-service";
import { UserRequest } from "../type/user-request";

export class AdminController {
  constructor ( private readonly orderService: OrderService ) {}
    async approveCancelation(req: Request, res: Response, next: NextFunction) {
        try {
            const orderId = req.params.orderId
            const userReq = req as UserRequest;
            const adminId = userReq.user?.id;

            if (!adminId) {
                throw new ResponseError(400, "Admin Invalid");
            }
    
            const response = await this.orderService.approveCancelation(orderId, adminId)
            
            res.status(200).json({
            data: response,
            })
        } catch (e) {
            next(e)
        }
        }

    async rejectCancelation(req: Request, res: Response, next: NextFunction) {
      try {
          const userReq = req as UserRequest;
          const userRole = userReq.user?.role;

          if (userRole !== Role.ADMIN) {
              throw new ResponseError(400, "user invalid");
          }
          const orderId = req.params.orderId

          const { rejectReason } = req.body
          const response = await this.orderService.rejectCancellation(orderId, rejectReason)
          res.status(200).json({
            data: response,
          });
      } catch (e) {
        next(e);
      }
    }

    async getAllOrder(req: Request, res: Response, next: NextFunction) {
      try {
          const userReq = req as UserRequest;
          const userRole = userReq.user?.role;

          if (userRole !== Role.ADMIN) {
              throw new ResponseError(400, "user invalid");
          }

          const response = await this.orderService.getAllOrderByAdmin()
          res.status(200).json({
            data: response,
          });
      } catch (e) {
        next(e);
      }
    }
}