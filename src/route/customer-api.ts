import express from "express";
import { CustomerController } from "../controller/customer-controller";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";

export const customerApiRouter = express.Router()
customerApiRouter.use(authMiddleware)
customerApiRouter.post("/add-rating-review", CustomerController.addRatingReview);
customerApiRouter.post("/rooms", RoomChatController.createOrGetRoom);
customerApiRouter.get("/rooms/:customerId", RoomChatController.getRoomsByCustomer);
customerApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoomByCustomer);
customerApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2)