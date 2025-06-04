import { Order, OrderCancellation, OrderShipping, OrderStatus, OrderType, Role } from "@prisma/client"

export interface CreateOrderItemRequest {
  name: string
  qty: number
  price: number
}

export interface CreateOrderRequest {
  tailorId: string
  customerId: string
  roomId: string
  customerName: string
  orderType: OrderType
  orderDate?: Date
  totalPrice: number

  deliveryAddress?: string | null
  deliveryServiceName?: string | null
  receiptNumber?: string | null
  deliveryImage?: string | null

  orderItems: CreateOrderItemRequest[]
}

export interface CompleteOrderRequest {
  orderId: string
  deliveryServiceName?: string
  receiptNumber?: string
}

export interface CancelOrderRequest {
  orderId: string
  userId: string  
  userRole: Role  
  cancellationReason: string
  cancellationImage?: string
}

export interface OrderItemResponse {
  id: string
  orderId: string
  name: string
  qty: number
  price: number
}

export interface UserInfoResponse {
  firstname: string
  lastname: string
  profilePicture: string | null
}

export interface OrderDetailResponse {
  id: string
  tailorId: string
  customerId: string
  customerName: string
  tailorName: string
  customerProfilePicture: string | null
  tailorProfilePicture: string | null
  roomId: string | null
  orderType: OrderType
  totalPrice: number
  status: OrderStatus
  orderDate: Date
  deliveryAddress?: string | null
  deliveryServiceName?: string | null
  receiptNumber?: string | null
  deliveryImage?: string | null
  cancellationReason?: string | null
  cancelledAt?: Date | null
  cancellationRequestImage?: string | null
  cancellationRejectedReason?: string | null
  isCancellationApproved?: boolean | null
  previousStatus?: OrderStatus | null
  updatedAt: Date
  orderItems: OrderItemResponse[]
}

export interface OrderWithRelations extends Order {
  orderItems: {
    id: string
    orderId: string
    name: string
    qty: number
    price: number
  }[]
  orderShipping?: OrderShipping | null
  orderCancellation?: OrderCancellation | null
  customer: {
    firstname: string
    lastname: string | null
    profilePicture: string | null
  }
  tailor: {
    firstname: string
    lastname: string | null
    profilePicture: string | null
  }
}

export const orderDetailInclude = {
  orderItems: true,
  customer: { select: { firstname: true, lastname: true, profilePicture: true } },
  tailor: { select: { firstname: true, lastname: true, profilePicture: true } },
  orderShipping: true,
  orderCancellation: true,
} as const

export function mapOrderToOrderDetailResponse(order: OrderWithRelations): OrderDetailResponse {
  return {
    id: order.id,
    tailorId: order.tailorId,
    customerId: order.customerId,
    customerName: `${order.customer?.firstname ?? ''} ${order.customer?.lastname ?? ''}`.trim(),
    tailorName: `${order.tailor?.firstname ?? ''} ${order.tailor?.lastname ?? ''}`.trim(),
    customerProfilePicture: order.customer.profilePicture,
    tailorProfilePicture: order.tailor.profilePicture,
    roomId: order.roomId,
    orderType: order.orderType,
    totalPrice: order.totalPrice,
    status: order.status,
    orderDate: order.orderDate,
    deliveryAddress: order.orderShipping?.deliveryAddress ?? "",
    deliveryServiceName: order.orderShipping?.deliveryServiceName ?? "",
    receiptNumber: order.orderShipping?.receiptNumber ?? null,
    deliveryImage: order.orderShipping?.deliveryImage ?? null,
    cancellationReason: order.orderCancellation?.cancellationReason ?? null,
    cancelledAt: order.orderCancellation?.cancelledAt ?? null,
    cancellationRequestImage: order.orderCancellation?.cancellationRequestImage ?? null,
    cancellationRejectedReason: order.orderCancellation?.cancellationRejectedReason ?? null,
    previousStatus: order.orderCancellation?.previousStatus ?? null,
    updatedAt: order.updatedAt,
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      name: item.name,
      qty: item.qty,
      price: item.price,
    }))
  }
}