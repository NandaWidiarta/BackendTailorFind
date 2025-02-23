import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  CreateCustomerRequest,
  LoginCustomerRequest,
  RatingReviewRequest,
} from "../model/customer-model";
import { CustomerService } from "../service/customer-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
// import { CustomerRequest } from "../type/customer-request";

export class CustomerController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateCustomerRequest = req.body as CreateCustomerRequest
      const response = await CustomerService.register(request)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginCustomerRequest = req.body as LoginCustomerRequest
      const response = await CustomerService.login(request)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  static async tes(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        message: "test",
      });
    } catch (e) {
      next(e);
    }
  }

  static async addRatingReview(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const rating = parseInt(req.body.rating)
      const review = req.body.review
      const tailorId = req.body.tailorId
      const customerId = req.body.customerId

      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new ResponseError(400, "Invalid rating value");
      }
      
      const response = await CustomerService.addRatingReview(
        { rating, review, tailorId, customerId }, 
        req.file
      )
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
  

  static async getHomeData(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "user id null");
      }

      const result = await CustomerService.getHomeData(userId);
      return res.json({ data: result });
    } catch (e) {
      next(e);
    }
  }
}

export const getHome: RequestHandler = async (req, res, next) => {
  try {
    const user = req as UserRequest;
    const userId = user.user?.id
    if (!userId) {
      return next();
    }
    const result = await CustomerService.getHomeData(userId);
    res.json({ data: result });
    return
  } catch (error) {
    next(error);
  }
};
