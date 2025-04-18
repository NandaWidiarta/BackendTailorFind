import express from "express";
import { CustomerController, getHome } from "../controller/customer-controller";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { OrderController } from "../controller/order-controller";
import { GeneralController } from "../controller/general-controller";

export const customerApiRouter = express.Router()
customerApiRouter.use(authMiddleware)
customerApiRouter.post("/add-rating-review",upload.single('file'), CustomerController.addRatingReview);
customerApiRouter.post("/rooms", RoomChatController.createOrGetRoom);
customerApiRouter.get("/rooms/:customerId", RoomChatController.getRoomsByCustomer);
customerApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoomByCustomer);
customerApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2)

//order
customerApiRouter.post("/order/upload-payment/:orderId", upload.single('file'), OrderController.uploadPaymentProof)
customerApiRouter.get("/order/:orderId", OrderController.getDetailOrder)
customerApiRouter.get("/order/all/:userId", OrderController.getAllOrderByCustomer)
customerApiRouter.post("/order/cancel/:orderId", upload.single('file'), OrderController.cancelOrder)
customerApiRouter.post("/order/complete/:orderId", OrderController.completeOrderByCustomer)
customerApiRouter.post("/order/midtrans-token/:orderId", OrderController.getMidtransToken);

customerApiRouter.get("/home", getHome)
customerApiRouter.post("/logout", GeneralController.logout)
customerApiRouter.patch("/update-profile", CustomerController.updateCustomerProfile)
customerApiRouter.post("/reset-password", GeneralController.resetPassword)
customerApiRouter.post("/forgot-password", GeneralController.forgotPassword);