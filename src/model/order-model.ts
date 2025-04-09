import { OrderType, Role } from "@prisma/client"

export type CreateOrderItemRequest = {
  name: string
  qty: number
  price: number
}

export type CreateOrderRequest = {
  tailorId: string
  customerId: string
  roomId: string
  customerName: string
  orderType: OrderType
  orderDate?: Date
  bankName: string
  bankAccountOwner: string
  bankAccountNumber: string
  totalPrice: number

  deliveryAddress?: string | null
  deliveryServiceName?: string | null
  receiptNumber?: string | null
  deliveryImage?: string | null
  paymentImage?: string | null

  orderItems: CreateOrderItemRequest[]
}

export type CompleteOrderRequest = {
  orderId: string;
  deliveryServiceName?: string;
  receiptNumber?: string;
}

export type CancelOrderRequest {
  orderId: string;
  userId: string;  
  userRole: Role;  
  cancellationReason: string;
}
