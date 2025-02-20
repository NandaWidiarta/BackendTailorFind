import { OrderStatus, Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { CreateOrderRequest } from "../model/order-model";
import { supabase } from "../supabase-client";
import { ResponseError } from "../error/response-error";

export class OrderService {
  static async createOrder(request: CreateOrderRequest) {
    const newOrder = await prismaClient.order.create({
      data: {
        ...request,
        orderItems: {
          create: request.orderItems,
        },
      },
      include: {
        orderItems: true,
      },
    });

    const orderId = newOrder.id;

    const chat = await prismaClient.chat.create({
      data: {
        roomId: request.roomId,
        senderId: request.tailorId,
        senderType: Role.TAILOR,
        message: orderId,
        type: "order",
      },
    });

    return {
      order: newOrder,
      chat: chat,
    };
  }

  static async uploadProofOfPayment(
    image: Express.Multer.File,
    orderId: string
  ) {
    if (!image) {
      throw new ResponseError(400, "no-image-uploadef")
    }

    let imageUrl: string | null = null
    const fileName = `${orderId}-${Date.now()}`

    const { data, error } = await supabase.storage
      .from("paymentProof") 
      .upload(fileName, image.buffer, {
        contentType: image.mimetype,
      })

    if (error) {
      throw new ResponseError(500, "failed-upload-payment-proof-to-database");
    }

    imageUrl = data?.path
      ? supabase.storage.from("paymentProof").getPublicUrl(data.path).data
          ?.publicUrl || null
      : null

    if (!imageUrl) {
      throw new ResponseError(500, "failed-to-generate-image-url")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: { paymentImage: imageUrl },
      select: { id: true, paymentImage: true }, 
    })

    if (!updatedOrder) {
      throw new ResponseError(400, "order-not-found")
    }

    return updatedOrder
  }


  static async getOrderDetail(orderId: string) {
    const order = await prismaClient.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: true, 
      }
    })

    if (!order) {
      throw new ResponseError(400, "order-not-found")
    }

    return order
  }

  static async getAllOrderByCustomer(userId: string) {
    const orders = await prismaClient.order.findMany({
      where: {
        customerId: userId,
      },
      include: {
        orderItems: true, 
      }
    })

    return orders
  }

  static async getAllOrderByTailor(userId: string) {
    const orders = await prismaClient.order.findMany({
      where: {
        tailorId: userId,
      },
      include: {
        orderItems: true, 
      }
    })

    return orders
  }

  static async completeOrderByTailor(orderId: string, userId: string) {
    const order = await prismaClient.order.findUnique({
      where: {
        id: orderId,
        tailorId: userId
      },
      include: {
        orderItems: true, 
      }
    })

    if (!order) {
      throw new ResponseError(400, "order-not-found")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DONE,
      },
      include: {
        orderItems: true,
      },
    })

    return updatedOrder
  }

  static async processOrder(orderId: string) {
    const order = await prismaClient.order.findUnique({
      where: {
        id: orderId
      },
      include: {
        orderItems: true
      }
    })

    if (!order) {
      throw new ResponseError(400, "order-not-found")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.ON_PROCCESS,
      },
      include: {
        orderItems: true,
      },
    })

    return updatedOrder
  }

}