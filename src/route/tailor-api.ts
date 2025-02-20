import express from "express";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { OrderController } from "../controller/order-controller";

export const tailorApiRouter = express.Router()
tailorApiRouter.use(authMiddleware)
tailorApiRouter.post("/rooms", RoomChatController.createOrGetRoom)
tailorApiRouter.get("/rooms/:tailorId", RoomChatController.getRoomsByTailor)
tailorApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoomByTailor)
tailorApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2)

//order
tailorApiRouter.post("/order/create", OrderController.createOrder)
tailorApiRouter.get("/order/:orderId", OrderController.getDetailOrder)
tailorApiRouter.get("/order/all/:userId", OrderController.getAllOrderByTailor)
tailorApiRouter.post("/order/process/:orderId", OrderController.processOrder)
tailorApiRouter.post("/order/complete", OrderController.completeOrderByTailor)