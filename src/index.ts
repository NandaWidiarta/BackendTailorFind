import dotenv from "dotenv";
import { web } from "./application/web";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
// import { ChatService } from "./service/chat-service";

dotenv.config();

const PORT = process.env.PORT;

const httpServer = createServer(web);

// // Socket.IO server
// const io = new SocketIOServer(httpServer, {
//   cors: {
//     origin: "*",
//   },
// });

// //INI BUAT JALANIN CHAT YANG ADA ROOM NYA 
// // EVENT SOCKET
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Client akan memanggil join, bawa roomId
//   socket.on("joinRoom", (data: { roomId: number }) => {
//     socket.join(`room-${data.roomId}`);
//     console.log(`User joined room: room-${data.roomId}`);
//   });

//   // Client kirim pesan
//   // data: { roomId, senderId, senderType, message, type }
//   socket.on("sendMessage", async (data) => {
//     console.log("sendMessage data:", data);

//     // 1) Simpan ke DB
//     const newChat = await ChatService.sendMessage(
//       data.roomId,
//       data.senderId,
//       data.senderType,
//       data.message,    // untuk image: ini URL supabase
//       data.type || "text" 
//     );

//     // 2) Broadcast
//     io.to(`room-${data.roomId}`).emit("newMessage", {
//       senderId: newChat.senderId,
//       senderType: newChat.senderType,
//       message: newChat.message,
//       type: newChat.type,
//       createdAt: newChat.createdAt
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
