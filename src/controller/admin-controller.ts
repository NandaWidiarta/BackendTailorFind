import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error";
import { OrderService } from "../service/order-service";
import { UserRequest } from "../type/user-request";

export class AdminController {
    static async confirmCustomerPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const userReq = req as UserRequest;
            const userRole = userReq.user?.role;

            if (userRole !== Role.ADMIN) {
                throw new ResponseError(400, "user invalid");
            }
          const orderId = req.params.orderId
          const response = await OrderService.confirmPaymentByAdmin(orderId)
          res.status(200).json({
            data: response,
          });
        } catch (e) {
          next(e);
        }
      }

    static async uploadPaymentProofToTailor(req: Request, res: Response, next: NextFunction) {
    try {
        const orderId = req.params.orderId

        if (!req.file) {
        return next()
        }

        const response = await OrderService.uploadProofOfPaymentToTailor(req.file, orderId)
        
        res.status(200).json({
        data: response,
        })
    } catch (e) {
        next(e)
    }
    }

    static async approveCancelation(req: Request, res: Response, next: NextFunction) {
        try {
            const orderId = req.params.orderId
            const userReq = req as UserRequest;
            const adminId = userReq.user?.id;

            if (!adminId) {
                throw new ResponseError(400, "Admin Invalid");
            }
    
            const response = await OrderService.approveCancelation(orderId, adminId)
            
            res.status(200).json({
            data: response,
            })
        } catch (e) {
            next(e)
        }
        }

    static async rejectCancelation(req: Request, res: Response, next: NextFunction) {
      try {
          const userReq = req as UserRequest;
          const userRole = userReq.user?.role;

          if (userRole !== Role.ADMIN) {
              throw new ResponseError(400, "user invalid");
          }
          const orderId = req.params.orderId

          const { rejectReason } = req.body
          const response = await OrderService.rejectCancellationByAdmin(orderId, rejectReason)
          res.status(200).json({
            data: response,
          });
      } catch (e) {
        next(e);
      }
    }

    static async rejectPaymentCustomer(req: Request, res: Response, next: NextFunction) {
      try {
          const userReq = req as UserRequest;
          const userRole = userReq.user?.role;

          if (userRole !== Role.ADMIN) {
              throw new ResponseError(400, "user invalid");
          }
          const orderId = req.params.orderId

          const { rejectReason } = req.body
          const response = await OrderService.rejectPaymentProofByAdmin(orderId, rejectReason)
          res.status(200).json({
            data: response,
          });
      } catch (e) {
        next(e);
      }
    }

    static async getAllOrder(req: Request, res: Response, next: NextFunction) {
      try {
          const userReq = req as UserRequest;
          const userRole = userReq.user?.role;

          if (userRole !== Role.ADMIN) {
              throw new ResponseError(400, "user invalid");
          }

          const response = await OrderService.getAllOrderByAdmin()
          res.status(200).json({
            data: response,
          });
      } catch (e) {
        next(e);
      }
    }
}