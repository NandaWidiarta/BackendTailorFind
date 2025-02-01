import dotenv from "dotenv";
import { web } from "./application/web";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "./service/chat-service";

dotenv.config();

const PORT = process.env.PORT;

const httpServer = createServer(web);

// Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

//INI BUAT JALANIN CHAT YANG ADA ROOM NYA 
// EVENT SOCKET
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Client akan memanggil join, bawa roomId
  socket.on("joinRoom", (data: { roomId: number }) => {
    socket.join(`room-${data.roomId}`);
    console.log(`User joined room: room-${data.roomId}`);
  });

  // Client kirim pesan
  socket.on("sendMessage", async (data: {
    roomId: number;
    senderId: number;
    senderType: string;
    message: string;
  }) => {
    console.log("masuk ke send message", data.roomId, data.senderId, data.senderType)
    // Simpan ke DB
    await ChatService.sendMessage(data.roomId, data.senderId, data.senderType, data.message);

    // Broadcast real-time ke semua user di room
    io.to(`room-${data.roomId}`).emit("newMessage", {
      senderId: data.senderId,
      senderType: data.senderType,
      message: data.message,
      time: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
