"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const web_1 = require("./application/web");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./service/chat-service");
dotenv_1.default.config();
const PORT = process.env.PORT;
const httpServer = (0, http_1.createServer)(web_1.web);
// Socket.IO server
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
//INI BUAT JALANIN CHAT YANG ADA ROOM NYA 
// EVENT SOCKET
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Client akan memanggil join, bawa roomId
    socket.on("joinRoom", (data) => {
        socket.join(`room-${data.roomId}`);
        console.log(`User joined room: room-${data.roomId}`);
    });
    // Client kirim pesan
    socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("masuk ke send message", data.roomId, data.senderId, data.senderType);
        // Simpan ke DB
        yield chat_service_1.ChatService.sendMessage(data.roomId, data.senderId, data.senderType, data.message);
        // Broadcast real-time ke semua user di room
        io.to(`room-${data.roomId}`).emit("newMessage", {
            senderId: data.senderId,
            senderType: data.senderType,
            message: data.message,
            time: new Date().toISOString()
        });
    }));
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
