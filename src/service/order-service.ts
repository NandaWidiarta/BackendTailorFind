import { OrderStatus, Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { CreateOrderRequest } from "../model/order-model";

export class OrderService {
    static async createOrder(request: CreateOrderRequest) {
    
        const newOrder = await prismaClient.order.create({
          data: {
            ...request,
            orderItems: {
                create: request.orderItems
            }
          },
          include: {
            orderItems: true,
          },
        })

        const orderId = newOrder.id

        const chat = await prismaClient.chat.create({
          data: {
            roomId: request.roomId,
            senderId: request.tailorId,
            senderType: Role.TAILOR,
            message: orderId,
            type: "order"
          }
        })

        return {
          order: newOrder,
          chat: chat
        }
      }

}