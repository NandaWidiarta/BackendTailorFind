import express from "express";
import { RoomChatController } from "../controller/room-chat-controller";
import { authTailorMiddleware } from "../middleware/auth-tailor-middleware";
import upload from "../middleware/multer";

export const tailorApiRouter = express.Router()
tailorApiRouter.use(authTailorMiddleware)
tailorApiRouter.post("/rooms", RoomChatController.createOrGetRoom);
tailorApiRouter.get("/rooms/:tailorId", RoomChatController.getRoomsByTailor);
tailorApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoom);
tailorApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2);