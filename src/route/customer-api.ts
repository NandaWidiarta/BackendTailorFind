import express from "express";
import { CustomerController } from "../controller/customer-controller";
import { authCustomerMiddleware } from "../middleware/auth-customer-middleware";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";

export const customerApiRouter = express.Router()
customerApiRouter.use(authCustomerMiddleware)
customerApiRouter.post("/add-rating-review", CustomerController.addRatingReview);
customerApiRouter.post("/rooms", RoomChatController.createOrGetRoom);
customerApiRouter.get("/rooms/:customerId", RoomChatController.getRoomsByCustomer);
customerApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoom);
customerApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2)