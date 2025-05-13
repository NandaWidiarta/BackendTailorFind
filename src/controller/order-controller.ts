import { Request, Response, NextFunction } from "express";
import { CreateOrderRequest } from "../model/order-model";
import { OrderService } from "../service/order-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
import { Role } from "@prisma/client";
import { supabase } from "../supabase-client";

export class OrderController {
  constructor ( private readonly orderService: OrderService ) {}
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as CreateOrderRequest
      const response = await this.orderService.createOrder(request);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async getDetailOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId
      const response = await this.orderService.getOrderDetail(orderId)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async getAllOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId
      const userReq = req as UserRequest
      const userRole = userReq.user?.role
  
      if (!userId || !userRole) {
        throw new ResponseError(400, "User Tidak Valid")
      }
  
      const response = await this.orderService.getAllOrder(userId, userRole)

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  async processOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId
      const response = await this.orderService.processOrder(orderId)
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async completeOrderByTailor(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, deliveryServiceName, receiptNumber} = req.body
      const response = await this.orderService.completeOrderByTailor(
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

  async completeOrderByCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params
      const response = await this.orderService.customerCompleteOrder(
        orderId
      )
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      const userRole = userReq.user?.role;
      const file = req.file
  
      if (!userId || !userRole) {
        throw new ResponseError(400, "user invalid");
      }
  
      const { orderId } = req.params;
      if (!orderId) {
        throw new ResponseError(400, "orderId is required");
      }

      const { cancellationReason } = req.body
      let imageUrl: string | null | undefined = undefined;


      if (file) {
        try {
          const result = await uploadFileToSupabase(file, orderId);
          imageUrl = result ?? undefined;
          if (!imageUrl) {
            throw new Error("Failed to upload image");
          }
        } catch (uploadErr) {
          throw new ResponseError(500, "Failed to upload file to Supabase");
        }
      }
  
      const response = await this.orderService.cancelOrder({
        orderId,
        userId, 
        userRole: userRole,
        cancellationReason: cancellationReason,
        cancellationImage: imageUrl
      });
  
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async getMidtransToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params
      const response = await this.orderService.createMidtransSnapToken(orderId);
      res.status(200).json({
        token: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "User Tidak Ditemukan");
      }

      const { balance } = req.body

      const response = await this.orderService.withdraw(userId as string, balance as number);

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }

  async autoCompleteLongPendingOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.orderService.autoCompleteLongPendingOrders();

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e)
    }
  }
  
}

async function uploadFileToSupabase(
  file: Express.Multer.File,
  orderId: string
): Promise<string | null> {
  try {
    const extension = file.originalname.split('.').pop();
    const fileName = `${orderId}-${Date.now()}.${extension || ''}`;

    const { data, error } = await supabase.storage
      .from('paymentProof')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false, 
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    let publicURL: string | null = null;
    if (data && data.path) {
      const { data: publicData } = supabase.storage
        .from('paymentProof')
        .getPublicUrl(data.path);
      publicURL = publicData?.publicUrl ?? null;
    }

    return publicURL;
  } catch (err) {
    console.error('Exception uploading to Supabase:', err);
    return null;
  }
}
