import { Request, Response, NextFunction } from "express";
import { CreateOrderRequest } from "../model/order-model";
import { OrderService } from "../service/order-service";

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
}
