import express from "express";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";

export const tailorApiRouter = express.Router()
tailorApiRouter.use(authMiddleware)
tailorApiRouter.post("/rooms", RoomChatController.createOrGetRoom);
tailorApiRouter.get("/rooms/:tailorId", RoomChatController.getRoomsByTailor);
tailorApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoomByTailor);
tailorApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2);