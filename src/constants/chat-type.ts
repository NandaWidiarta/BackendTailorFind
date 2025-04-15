export enum ChatType {
    TEXT = "text", 
    ORDER = "order", 
    REQUEST_CANCEL_ORDER = "requestCancelOrder",
    PAYMENT_CUSTOMER_CONFIRMED = "paymentCustomerConfirmed",
    ORDER_CANCELED = "orderCanceled",
    CANCELATION_REQUEST_REJECTED = "cancelationRequestRejected",
    PAYMENT_CUSTOMER_REJECTED = "paymentCustomerRejected",
    CUSTOMER_RECEIVED = "customerReceived",
    PAYMENT_TO_TAILOR_SUCCESS = "paymentToTailorSuccess",
    ORDER_DELIVERED = "orderDelivered",
    ORDER_COMPLETED_BY_TAILOR = "orderCompletedByTailor",
}