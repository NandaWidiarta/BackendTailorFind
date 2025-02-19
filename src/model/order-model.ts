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
  orderDate?: Date
  bankName: string
  bankAccountOwner: string
  bankAccountNumber: string
  totalPrice: number

  deliveryServiceName?: string | null
  receiptNumber?: string | null
  deliveryImage?: string | null
  paymentImage?: string | null

  orderItems: CreateOrderItemRequest[]
}
