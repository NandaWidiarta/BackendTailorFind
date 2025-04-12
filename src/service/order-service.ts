import { OrderStatus, Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { CancelOrderRequest, CompleteOrderRequest, CreateOrderRequest } from "../model/order-model";
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
        customer: {
          select: {
            firstname: true,
            lastname: true,
          }
        },
        tailor: {
          select: {
            firstname: true,
            lastname: true,
          }
        }
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
        tailor: {
          select: {
            firstname: true,
            lastname: true,
          }
        }
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
        customer: {
          select: {
            firstname: true,
            lastname: true,
          }
        }
      }
    })
    return orders
  }

  static async completeOrderByTailor(request: CompleteOrderRequest, packetImage ?: Express.Multer.File) {

    let imageUrl: string | null = null;
    if (packetImage) {
      const fileName = `${request.orderId}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("packetImage")
        .upload(fileName, packetImage.buffer, {
          contentType: packetImage.mimetype,
        });

      if (error) {
        throw new ResponseError(500, "failed-upload-packet-image-to-database");
      }

      imageUrl = data?.path
        ? supabase.storage.from("packetImage").getPublicUrl(data.path).data
            ?.publicUrl || null
        : null;
    }

    const order = await prismaClient.order.findUnique({
      where: {
        id: request.orderId
      },
      include: {
        orderItems: true, 
      }
    })

    if (!order) {
      throw new ResponseError(400, "order-not-found")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: request.orderId },
      data: {
        status: OrderStatus.DONE,
        deliveryServiceName: request.deliveryServiceName,
        receiptNumber: request.receiptNumber,
        deliveryImage: imageUrl
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

  static async cancelOrder(request: CancelOrderRequest) {
    const order = await prismaClient.order.findUnique({
      where: { id: request.orderId },
    });
    
    if (!order) {
      throw new ResponseError(400, "order-not-found")
    }
    
    if (
      (request.userRole === Role.CUSTOMER && order.customerId !== request.userId) || 
      (request.userRole === Role.TAILOR && order.tailorId !== request.userId)
    ) {
      throw new ResponseError(400, "user-not-same")
    }
    
    if (order.status !== OrderStatus.NOT_YET_PAY) {
      throw new ResponseError(400, "order-cannot-cancel")
    }
    
    const updatedOrder = await prismaClient.order.update({
      where: { id: request.orderId },
      data: {
        status: OrderStatus.CANCELED,
        cancellationReason: request.cancellationReason,
        cancelledBy: request.userRole,
        cancelledAt: new Date(),
      },
      include: {
        orderItems: true,
      },
    });
    
    const cancellationMessage = `Order #${request.orderId} telah dibatalkan oleh ${request.userRole === Role.CUSTOMER ? 'customer' : 'tailor'} dengan alasan: ${request.cancellationReason}`;
    
    const chat = await prismaClient.chat.create({
      data: {
        roomId: order.roomId,
        senderId: request.userId,
        senderType: request.userRole,
        message: cancellationMessage,
        type: "cancelOrder",
      },
    });
    
    await prismaClient.roomChat.update({
      where: { id: order.roomId },
      data: {
        latestMessage: cancellationMessage,
        latestMessageTime: new Date(),
        unreadCountCustomer: request.userRole === Role.TAILOR
          ? { increment: 1 } 
          : undefined,
        unreadCountTailor: request.userRole === Role.CUSTOMER
          ? { increment: 1 }  
          : undefined,
      }
    });
    
    return {
      order: updatedOrder,
      chat: chat,
    };
  }

}