import { OrderStatus, OrderType, Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { CancelOrderRequest, CompleteOrderRequest, CreateOrderRequest } from "../model/order-model";
import { supabase } from "../supabase-client";
import { ResponseError } from "../error/response-error";
import { ChatService } from "./chat-service";
import { ChatType } from "../constants/chat-type";
import { snap } from "../instance/midtrans-client";
import { ADMIN_FEE, ADMIN_FEE_NAME } from "../constants/constant";
import { v4 as uuid } from "uuid";

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
    orderId: string,
    customerPaymentBankName: string,
    customerAccountName: string,
    customerAccount: string
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
      data: { 
        paymentImage: imageUrl, 
        customerPaymentBankName: customerPaymentBankName,
        customerAccountName: customerAccountName,
        customerAccount: customerAccount,
        status: OrderStatus.WAITING_ADMIN_PAYMENT_VERIFICATION
       },
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

  static async getAllOrderByAdmin() {
    const orders = await prismaClient.order.findMany()
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
        status: order.orderType == OrderType.DELIVERY ? OrderStatus.TAILOR_SENT_PRODUCT : OrderStatus.WAITING_CUSTOMER_RECEIVE_CONFIRMATION,
        deliveryServiceName: request.deliveryServiceName,
        receiptNumber: request.receiptNumber,
        deliveryImage: imageUrl
      },
      include: {
        orderItems: true,
      },
    })

    await ChatService.sendMessage(
      order.roomId,
      order.customerId,
      Role.CUSTOMER,
      order.id,
      order.orderType == OrderType.DELIVERY ? ChatType.ORDER_DELIVERED  : ChatType.ORDER_COMPLETED_BY_TAILOR
    );

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

    const admin = await prismaClient.user.findFirst({
      where: { role: Role.ADMIN },
      select: { id: true } 
    })

    if (!admin) {
      throw new ResponseError(500, "Terjadi Kesalahan")
    }

    await prismaClient.user.update({
      where: { id: admin.id },
      data: {
        walletBalance: { increment: order.totalPrice }
      }
    })

    await ChatService.sendMessage(
      order.roomId,
      "admin-system",
      Role.ADMIN,
      order.id,
      ChatType.PAYMENT_CUSTOMER_CONFIRMED 
    );

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
    
    if (order.status == OrderStatus.DONE) {
      throw new ResponseError(400, "order-cannot-cancel")
    }
    
    const orderStatusTemp = order.status

    const updatedOrder = await prismaClient.order.update({
      where: { id: request.orderId },
      data: {
        status: OrderStatus.ADMIN_REVIEWING_CANCELLATION,
        cancellationReason: request.cancellationReason,
        cancelledBy: request.userRole,
        cancelledAt: new Date(),
        cancellationRequestImage: request.cancellationImage,
        previousStatus: orderStatusTemp
      },
      include: {
        orderItems: true,
      },
    });
    
    // const cancellationMessage = `Order #${request.orderId} telah dibatalkan oleh ${request.userRole === Role.CUSTOMER ? 'customer' : 'tailor'} dengan alasan: ${request.cancellationReason}`;
    
    const chat = await prismaClient.chat.create({
      data: {
        roomId: order.roomId,
        senderId: request.userId,
        senderType: request.userRole,
        message: order.id,
        type: ChatType.REQUEST_CANCEL_ORDER,
      },
    });
    
    await prismaClient.roomChat.update({
      where: { id: order.roomId },
      data: {
        latestMessage: ChatType.REQUEST_CANCEL_ORDER,
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

  static async customerCompleteOrder(orderId: string) {
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
        status: OrderStatus.DONE,
      },
      include: {
        orderItems: true,
      },
    })

    const admin = await prismaClient.user.findFirst({
      where: { role: Role.ADMIN },
      select: { id: true } 
    })

    if (!admin) {
      throw new ResponseError(500, "Terjadi Kesalahan")
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

    await ChatService.sendMessage(
      order.roomId,
      order.customerId,
      Role.CUSTOMER,
      order.id,
      ChatType.CUSTOMER_RECEIVED 
    );

    return updatedOrder
  }


  //ADMIN ROLE
  static async confirmPaymentByAdmin(orderId: string) {
    const order = await prismaClient.order.findUnique({ where: { id: orderId } });
  
    if (!order) throw new ResponseError(404, "order-not-found");
    if (order.status !== OrderStatus.WAITING_ADMIN_PAYMENT_VERIFICATION) {
      throw new ResponseError(400, "payment-already-confirmed");
    }
  
    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.ON_PROCCESS },
    });

    await ChatService.sendMessage(
      order.roomId,
      "admin-system",
      Role.ADMIN,
      // `✅ Pembayaran untuk Order #${order.id} telah dikonfirmasi oleh Admin.`,
      order.id,
      ChatType.PAYMENT_CUSTOMER_CONFIRMED 
    );
    
    return updatedOrder;
  }

  static async uploadProofOfPaymentToTailor(
    image: Express.Multer.File,
    orderId: string,
  ) {
    if (!image) {
      throw new ResponseError(400, "no-image-uploaded")
    }

    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ResponseError(400, "order-not-found")
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
      data: { 
        paymentToTailorImage: imageUrl, 
        status: OrderStatus.DONE
       }
    })

    if (!updatedOrder) {
      throw new ResponseError(400, "order-not-found")
    }

    await ChatService.sendMessage(
      order.roomId,
      "admin",
      Role.ADMIN,
      order.id,
      ChatType.PAYMENT_TO_TAILOR_SUCCESS
    );

    return updatedOrder
  }

  static async approveCancelation(
    orderId: string,
    adminId: string
  ) {

    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ResponseError(400, "Order Tidak Ditemukan")
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: { 
        status: OrderStatus.CANCELED,
        isCancellationApproved: true
       }
    })

    if (!updatedOrder) {
      throw new ResponseError(400, "Order Tidak Ditemukan")
    }

    await prismaClient.user.update({
      where: { id: order.customerId },
      data: {
        walletBalance: { increment: order.totalPrice }
      }
    })

    await prismaClient.user.update({
      where: { id: adminId },
      data: {
        walletBalance: { decrement: order.totalPrice - ADMIN_FEE }
      }
    })

    await ChatService.sendMessage(
      order.roomId,
      "admin",
      Role.ADMIN,
      order.id,
      ChatType.ORDER_CANCELED
    );

    return updatedOrder
  }

  static async rejectCancellationByAdmin(orderId: string, rejectReason: string) {
    const order = await prismaClient.order.findUnique({ where: { id: orderId } });
  
    if (!order) throw new ResponseError(404, "order-not-found");
  
    if (order.status !== OrderStatus.ADMIN_REVIEWING_CANCELLATION) {
      throw new ResponseError(400, "order-is-not-in-review-status");
    }
  
    if (!order.previousStatus) {
      throw new ResponseError(400, "cannot-revert-without-previous-status");
    }
  
    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status: order.previousStatus,
        previousStatus: null,
        isCancellationApproved: false,
        cancellationRejectedReason: rejectReason,
      },
    });
  
    // (opsional) kirim chat ke customer
    await ChatService.sendMessage(
      order.roomId,
      "admin-system",
      Role.ADMIN,
      order.id,
      ChatType.CANCELATION_REQUEST_REJECTED
    );
  
    return updatedOrder;
  }

  static async rejectPaymentProofByAdmin(orderId: string, rejectReason: string) {
    const order = await prismaClient.order.findUnique({ where: { id: orderId } });
  
    if (!order) throw new ResponseError(404, "order-not-found");
  
    if (order.status !== OrderStatus.WAITING_ADMIN_PAYMENT_VERIFICATION) {
      throw new ResponseError(400, "order-is-not-in-review-status");
    }
  
    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAYMENT_REJECTED,
        cancellationReason: rejectReason,
      },
    });

    await ChatService.sendMessage(
      order.roomId,
      "admin",
      Role.ADMIN,
      order.id,
      ChatType.PAYMENT_CUSTOMER_REJECTED
    );
  
    return updatedOrder;
  }

  static async createMidtransSnapToken(orderId: string) {
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
  
    // Tambahkan item untuk admin fee
    items.push({
      id: 'ADMIN_FEE',
      name: ADMIN_FEE_NAME,
      quantity: 1,
      price: adminFee
    })
  
    const grossAmount = items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    const uniqueOrderId = `${order.id}-${uuid().slice(0, 8)}`;
  
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
  




}