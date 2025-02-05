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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomChatController = void 0;
const chat_service_1 = require("../service/chat-service");
class RoomChatController {
    // Buat atau ambil room 1–1 antara customer & tailor
    static createOrGetRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customerId, tailorId } = req.body; // misal { customerId: 10, tailorId: 5 }
                const room = yield chat_service_1.ChatService.createOrGetRoom(customerId, tailorId);
                res.json(room);
            }
            catch (e) {
                res.status(500).json({ error: getErrorMessage(e) });
            }
        });
    }
    // Ambil daftar room milik customer
    static getRoomsByCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("masuk controller try");
                const customerId = parseInt(req.params.customerId);
                const rooms = yield chat_service_1.ChatService.getRoomsByCustomer(customerId);
                res.json(rooms);
            }
            catch (e) {
                console.log("masuk controller catch");
                res.status(500).json({ error: getErrorMessage(e) });
            }
        });
    }
    // Ambil daftar room milik tailor
    static getRoomsByTailor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tailorId = parseInt(req.params.tailorId);
                const rooms = yield chat_service_1.ChatService.getRoomsByTailor(tailorId);
                res.json(rooms);
            }
            catch (e) {
                res.status(500).json({ error: getErrorMessage(e) });
            }
        });
    }
    // Ambil semua chat di room
    static getChatsInRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomId = parseInt(req.params.roomId);
                const chats = yield chat_service_1.ChatService.getChatsInRoom(roomId);
                res.json(chats);
            }
            catch (e) {
                res.status(500).json({ error: getErrorMessage(e) });
            }
        });
    }
    // Kirim pesan (opsional, jika pakai HTTP)
    static sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("masuk controller sendMessage");
                const roomId = parseInt(req.params.roomId);
                const { senderId, senderType, message, type } = req.body;
                const chat = yield chat_service_1.ChatService.sendMessage(roomId, senderId, senderType, message, type);
                res.json(chat);
            }
            catch (e) {
                res.status(500).json({ error: getErrorMessage(e) });
            }
        });
    }
    // Ambil daftar room milik customer
    static tes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("masuk controller try");
                const customerId = 3;
                const rooms = yield chat_service_1.ChatService.getRoomsByCustomer(customerId);
                res.json(rooms);
            }
            catch (e) {
                console.log("masuk controller catch");
                res.status(500).json({ error: getErrorMessage(e) });
            }
        });
    }
}
exports.RoomChatController = RoomChatController;
function getErrorMessage(e) {
    if (e instanceof Error) {
        return e.message;
    }
    return 'An unknown error occurred';
}
