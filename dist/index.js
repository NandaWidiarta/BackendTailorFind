"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const web_1 = require("./application/web");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const PORT = process.env.PORT;
// web.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
const httpServer = (0, http_1.createServer)(web_1.web);
// Socket.IO server
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
// HIDUPIN INI BUAT JALANIN CHAT UNGU
// type UserList = Map<string, Set<string>>;
// let userList: UserList = new Map();
// io.on("connection", (socket) => {
//   const userName = socket.handshake.query.userName as string;
//   if (userName) {
//     addUser(userName, socket.id);
//     // Emit updated user list
//     io.emit("user-list", Array.from(userList.keys()));
//     // Handle message event
//     socket.on("message", (msg: string) => {
//       io.emit("message-broadcast", { message: msg, userName });
//     });
//     // Handle disconnect event
//     socket.on("disconnect", () => {
//       removeUser(userName, socket.id);
//       io.emit("user-list", Array.from(userList.keys()));
//     });
//   }
// });
// // Helper functions
// function addUser(userName: string, id: string): void {
//   if (!userList.has(userName)) {
//     userList.set(userName, new Set([id]));
//   } else {
//     userList.get(userName)?.add(id);
//   }
// }
// function removeUser(userName: string, id: string): void {
//   if (userList.has(userName)) {
//     const userIds = userList.get(userName);
//     userIds?.delete(id);
//     if (userIds?.size === 0) {
//       userList.delete(userName);
//     }
//   }
// }
//INI BUAT JALANIN CHAT YANG ADA ROOM NYA 
// Handle socket.io events
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join", (data) => {
        socket.join(data.room);
        console.log(`User joined room: ${data.room}`);
        socket.broadcast.to(data.room).emit("user joined");
    });
    socket.on("message", (data) => {
        console.log(`Message received in room ${data.room}: ${data.message}`);
        io.in(data.room).emit("new message", {
            user: data.user,
            message: data.message,
        });
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
