"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web = void 0;
const express_1 = __importDefault(require("express"));
const public_api_1 = require("../route/public-api");
const error_middleware_1 = require("../middleware/error-middleware");
exports.web = (0, express_1.default)();
exports.web.use(express_1.default.json());
exports.web.use(express_1.default.urlencoded({ extended: true }));
exports.web.use(public_api_1.publicRouter);
exports.web.use(error_middleware_1.errorMiddleware);
// // Create HTTP server and attach socket.io
// export const server = createServer(web);
// export const io = new SocketIOServer(server);
// // Handle socket.io events
// io.on("connection", (socket) => {
//     console.log("A user connected");
//     socket.on("join", (data: { room: string }) => {
//         socket.join(data.room);
//         console.log(`User joined room: ${data.room}`);
//         socket.broadcast.to(data.room).emit("user joined");
//     });
//     socket.on("message", (data: { room: string; user: string; message: string }) => {
//         console.log(`Message received in room ${data.room}: ${data.message}`);
//         io.in(data.room).emit("new message", { user: data.user, message: data.message });
//     });
//     socket.on("disconnect", () => {
//         console.log("A user disconnected");
//     });
// });
