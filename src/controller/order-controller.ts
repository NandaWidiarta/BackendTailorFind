import { Request, Response, NextFunction } from "express";
import { CreateOrderRequest } from "../model/order-model";
import { OrderService } from "../service/order-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as CreateOrderRequest
      const response = await OrderService.createOrder(request);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId

      if (!req.file) {
        return next()
      }

      const response = await OrderService.uploadProofOfPayment(req.file, orderId)
      
      res.status(200).json({
        data: response,
      })
    } catch (e) {
      next(e)
    }
  }

  static async getDetailOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId
      const response = await OrderService.getOrderDetail(orderId)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllOrderByCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId
      const response = await OrderService.getAllOrderByCustomer(userId)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllOrderByTailor(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId
      const response = await OrderService.getAllOrderByTailor(userId)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async processOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId
      const response = await OrderService.processOrder(orderId)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async completeOrderByTailor(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, deliveryServiceName, receiptNumber} = req.body
      const response = await OrderService.completeOrderByTailor(
        {orderId, deliveryServiceName, receiptNumber },
        req.file
      )
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
