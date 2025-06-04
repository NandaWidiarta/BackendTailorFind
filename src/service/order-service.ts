import { Chat, OrderStatus, OrderType, Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { CancelOrderRequest, CompleteOrderRequest, CreateOrderRequest, mapOrderToOrderDetailResponse, orderDetailInclude, OrderDetailResponse, OrderWithRelations } from "../dto/order-dto";
import { supabase } from "../supabase-client";
import { ResponseError } from "../error/response-error";
import { ChatService } from "./chat-service";
import { ChatType } from "../constants/chat-type";
import { snap } from "../instance/midtrans-client";
import { ADMIN_FEE, ADMIN_FEE_NAME } from "../constants/constant";
import { v4 as uuid } from "uuid";

export class OrderService {
  async createOrder(request: CreateOrderRequest): Promise<{ order: OrderDetailResponse, chat: any }> {
    const chatService = new ChatService()

    const newOrder = await prismaClient.order.create({
      data: {
        tailorId: request.tailorId,
        customerId: request.customerId,
        roomId: request.roomId,
        orderType: request.orderType,
        totalPrice: request.totalPrice,
        status: OrderStatus.NOT_YET_PAY,
        orderItems: {
          create: request.orderItems,
        },
        orderShipping: request.orderType === OrderType.DELIVERY ? {
          create: {
            deliveryAddress: request.deliveryAddress || null,
            deliveryServiceName: request.deliveryServiceName || null,
            receiptNumber: request.receiptNumber || null,
            deliveryImage: null,
          },
        } : undefined,
      },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    const chat = await chatService.sendMessage(
      request.roomId,
      Role.TAILOR,
      newOrder.id,
      ChatType.ORDER
    )

    const response = mapOrderToOrderDetailResponse(newOrder)
    return {
      order: response,
      chat,
    }
  }

  async getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    if (!order) {
      throw new ResponseError(404, "Order tidak ditemukan")
    }

    const response = mapOrderToOrderDetailResponse(order)

    return response
  }

  async getAllOrder(userId: string, role: Role): Promise<OrderDetailResponse[]> {
    let orders

    if (role === Role.CUSTOMER) {
      orders = await prismaClient.order.findMany({
        where: { customerId: userId },
        include: orderDetailInclude
      }) as unknown as OrderWithRelations[]
    } else if (role === Role.TAILOR) {
      orders = await prismaClient.order.findMany({
        where: { tailorId: userId },
        include: orderDetailInclude
      }) as unknown as OrderWithRelations[]
    } else {
      orders = await prismaClient.order.findMany({
        include: orderDetailInclude
      }) as unknown as OrderWithRelations[]
    }

    await this.autoCompleteLongPendingOrders()

    return orders.map(mapOrderToOrderDetailResponse)
  }

  async completeOrderByTailor(request: CompleteOrderRequest, packetImage?: Express.Multer.File): Promise<OrderDetailResponse> {
    const chatService = new ChatService()

    const order = await prismaClient.order.findUnique({
      where: { id: request.orderId }
    })

    if (!order) {
      throw new ResponseError(400, "Order tidak ditemukan")
    }

    let imageUrl: string | null = null
    if (packetImage) {
      const fileName = `${request.orderId}-${Date.now()}`
      const { data, error } = await supabase.storage
        .from("packetImage")
        .upload(fileName, packetImage.buffer, {
          contentType: packetImage.mimetype,
        })

      if (error) {
        throw new ResponseError(500, "Gagal mengupload gambar ke server")
      }

      imageUrl = data?.path
        ? supabase.storage.from("packetImage").getPublicUrl(data.path).data?.publicUrl || null
        : null
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: request.orderId },
      data: {
        status: order.orderType === OrderType.DELIVERY
          ? OrderStatus.TAILOR_SENT_PRODUCT
          : OrderStatus.WAITING_CUSTOMER_RECEIVE_CONFIRMATION,
        updatedAt: new Date(),
      },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    const existingShipping = await prismaClient.orderShipping.findUnique({
      where: { orderId: request.orderId }
    })

    if (existingShipping) {
      await prismaClient.orderShipping.update({
        where: { orderId: request.orderId },
        data: {
          deliveryServiceName: request.deliveryServiceName,
          receiptNumber: request.receiptNumber,
          deliveryImage: imageUrl,
        },
      })
    } else {
      await prismaClient.orderShipping.create({
        data: {
          orderId: request.orderId,
          deliveryServiceName: request.deliveryServiceName,
          receiptNumber: request.receiptNumber,
          deliveryImage: imageUrl,
        },
      })
    }

    const roomId = await createRoomIfNeeded(updatedOrder)

    await chatService.sendMessage(
      roomId,
      Role.TAILOR,
      updatedOrder.id,
      updatedOrder.orderType === OrderType.DELIVERY
        ? ChatType.ORDER_DELIVERED
        : ChatType.ORDER_COMPLETED_BY_TAILOR
    )

    const finalOrder = await prismaClient.order.findUnique({
      where: { id: request.orderId },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    return mapOrderToOrderDetailResponse(finalOrder)
  }

  async payment(orderId: string): Promise<OrderDetailResponse> {
    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
      include: orderDetailInclude,
    })

    if (!order) {
      throw new ResponseError(400, "Order tidak ditemukan")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.ON_PROCCESS },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    const admin = await prismaClient.user.findFirst({
      where: { role: Role.ADMIN },
      select: { id: true },
    })

    if (!admin) {
      throw new ResponseError(500, "Admin tidak ditemukan")
    }

    await prismaClient.user.update({
      where: { id: admin.id },
      data: { walletBalance: { increment: updatedOrder.totalPrice } },
    })

    const chatService = new ChatService()
    const roomId = await createRoomIfNeeded(updatedOrder)

    await chatService.sendMessage(
      roomId,
      Role.ADMIN,
      updatedOrder.id,
      ChatType.PAYMENT_CUSTOMER_CONFIRMED
    )

    return mapOrderToOrderDetailResponse(updatedOrder)
  }

  async cancelOrder(request: CancelOrderRequest): Promise<{ order: OrderDetailResponse, chat: any }> {
    const order = await prismaClient.order.findUnique({
      where: { id: request.orderId },
      include: orderDetailInclude,
    })

    if (!order) {
      throw new ResponseError(400, "Order tidak ditemukan")
    }

    if (
      (request.userRole === Role.CUSTOMER && order.customerId !== request.userId) ||
      (request.userRole === Role.TAILOR && order.tailorId !== request.userId)
    ) {
      throw new ResponseError(400, "User tidak sama")
    }

    if (order.status === OrderStatus.DONE) {
      throw new ResponseError(400, "Order tidak bisa dicancel")
    }

    const newStatus =
      order.status === OrderStatus.NOT_YET_PAY
        ? OrderStatus.CANCELED
        : OrderStatus.ADMIN_REVIEWING_CANCELLATION

    const updatedOrder = await prismaClient.order.update({
      where: { id: request.orderId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    const existingCancellation = await prismaClient.orderCancellation.findUnique({
      where: { orderId: request.orderId },
    })

    if (existingCancellation) {
      await prismaClient.orderCancellation.update({
        where: { orderId: request.orderId },
        data: {
          cancellationReason: request.cancellationReason,
          cancellationRequestImage: request.cancellationImage,
          previousStatus: order.orderCancellation?.previousStatus ?? order.status,
        },
      })
    } else {
      await prismaClient.orderCancellation.create({
        data: {
          orderId: request.orderId,
          cancellationReason: request.cancellationReason,
          cancellationRequestImage: request.cancellationImage,
          previousStatus: order.status,
        },
      })
    }

    const chatService = new ChatService()
    const roomId = await createRoomIfNeeded(updatedOrder)

    const chat = await chatService.sendMessage(
      roomId,
      request.userRole,
      updatedOrder.id,
      order.status === OrderStatus.NOT_YET_PAY ? ChatType.ORDER_CANCELED : ChatType.REQUEST_CANCEL_ORDER
    )

    return {
      order: mapOrderToOrderDetailResponse(updatedOrder),
      chat,
    }
  }

  async customerCompleteOrder(orderId: string): Promise<OrderDetailResponse> {
    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    if (!order) {
      throw new ResponseError(400, "Order tidak ditemukan")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DONE,
        updatedAt: new Date(),
      },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    const admin = await prismaClient.user.findFirst({
      where: { role: Role.ADMIN },
      select: { id: true }
    })

    if (!admin) {
      throw new ResponseError(500, "Admin tidak ditemukan")
    }

    await prismaClient.user.update({
      where: { id: admin.id },
      data: {
        walletBalance: { decrement: order.totalPrice - ADMIN_FEE }
      }
    })

    await prismaClient.user.update({
      where: { id: order.tailorId },
      data: {
        walletBalance: { increment: order.totalPrice - ADMIN_FEE }
      }
    })

    const chatService = new ChatService()
    const roomId = await createRoomIfNeeded(updatedOrder)

    await chatService.sendMessage(
      roomId,
      Role.CUSTOMER,
      updatedOrder.id,
      ChatType.CUSTOMER_RECEIVED
    )

    return mapOrderToOrderDetailResponse(updatedOrder)
  }

  async approveCancelation(orderId: string, adminId: string): Promise<OrderDetailResponse> {
    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        customer: { select: { firstname: true, lastname: true, profilePicture: true } },
        tailor: { select: { firstname: true, lastname: true, profilePicture: true } },
        orderShipping: true,
        orderCancellation: true,
      },
    })

    if (!order) {
      throw new ResponseError(400, "Order tidak ditemukan")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELED,
        updatedAt: new Date(),
      },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    await prismaClient.orderCancellation.update({
      where: { orderId: orderId },
      data: { cancelledAt: new Date() },
    })

    await prismaClient.user.update({
      where: { id: updatedOrder.customerId },
      data: {
        walletBalance: { increment: updatedOrder.totalPrice },
      },
    })

    await prismaClient.user.update({
      where: { id: adminId },
      data: {
        walletBalance: { decrement: updatedOrder.totalPrice - ADMIN_FEE },
      },
    })

    const chatService = new ChatService()
    const roomId = await createRoomIfNeeded(updatedOrder)

    await chatService.sendMessage(
      roomId,
      Role.CUSTOMER,
      updatedOrder.id,
      ChatType.ORDER_CANCELED
    )

    await this.autoCompleteLongPendingOrders()

    const result = mapOrderToOrderDetailResponse(updatedOrder)
    return result
  }

  async rejectCancellation(orderId: string, rejectReason: string): Promise<OrderDetailResponse> {
    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
      include: orderDetailInclude,
    })

    if (!order) throw new ResponseError(400, "Order tidak ditemukan")

    if (!order.orderCancellation) {
      throw new ResponseError(400, "data tidak ditemukan")
    }

    if (order.status !== OrderStatus.ADMIN_REVIEWING_CANCELLATION) {
      throw new ResponseError(400, "Order tidak dalam status review admin")
    }

    if (!order.orderCancellation.previousStatus) {
      throw new ResponseError(400, "Data status sebelumnya tidak ditemukan")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status: order.orderCancellation.previousStatus,
        updatedAt: new Date(),
      },
      include: orderDetailInclude,
    }) as unknown as OrderWithRelations

    await prismaClient.orderCancellation.update({
      where: { orderId },
      data: {
        previousStatus: null,
        cancellationRejectedReason: rejectReason,
      },
    })

    const chatService = new ChatService()
    const roomId = await createRoomIfNeeded(updatedOrder)

    await chatService.sendMessage(
      roomId,
      Role.ADMIN,
      updatedOrder.id,
      ChatType.CANCELATION_REQUEST_REJECTED
    )

    await this.autoCompleteLongPendingOrders()

    return mapOrderToOrderDetailResponse(updatedOrder)
  }



  async createMidtransSnapToken(orderId: string) {
    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        customer: true
      }
    })

    if (!order) throw new Error('Order not found')

    const adminFee = ADMIN_FEE

    const items = order.orderItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.qty,
      price: item.price
    }))

    items.push({
      id: 'ADMIN_FEE',
      name: ADMIN_FEE_NAME,
      quantity: 1,
      price: adminFee
    })

    const grossAmount = items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    const uniqueOrderId = `${order.id}${uuid().slice(0, 3)}`

    const parameter = {
      transaction_details: {
        order_id: uniqueOrderId,
        gross_amount: grossAmount
      },
      item_details: items,
      customer_details: {
        first_name: order.customer.firstname,
        email: order.customer.email,
        phone: order.customer.phoneNumber
      }
    }

    const transaction = await snap.createTransaction(parameter)
    return transaction.token
  }

  async withdraw(userId: string, amount: number) {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true
      }
    })

    if (!user) {
      throw new ResponseError(400, "User tidak ditemukan")
    }

    if (user.walletBalance < amount) {
      throw new ResponseError(400, "Saldo tidak cukup")
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          decrement: amount
        }
      }
    })

    return {
      message: 'Withdraw berhasil',
      balance: updatedUser.walletBalance.toString()
    }
  }

  async autoCompleteLongPendingOrders() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const orders = await prismaClient.order.findMany({
      where: {
        status: {
          in: [OrderStatus.TAILOR_SENT_PRODUCT, OrderStatus.WAITING_CUSTOMER_RECEIVE_CONFIRMATION],
        },
        updatedAt: {
          lte: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
      },
    })

    for (const order of orders) {
      await this.customerCompleteOrder(order.id)
    }

    return { totalProcessed: orders.length }
  }

}

async function createRoomIfNeeded(order: { id: string, roomId: string | null, customerId: string, tailorId: string }) {
  const chatService = new ChatService()

  if (!order.roomId) {
    const room = await chatService.createOrGetRoom(order.customerId, order.tailorId)

    await prismaClient.order.update({
      where: { id: order.id },
      data: { roomId: room.id },
    })

    return room.id
  }

  return order.roomId
}