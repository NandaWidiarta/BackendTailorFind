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
exports.ChatService = void 0;
const database_1 = require("../application/database");
class ChatService {
    // 1. Buat atau ambil room 1–1
    static createOrGetRoom(customerId, tailorId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Cek apakah sudah ada room
            let room = yield database_1.prismaClient.roomChat.findFirst({
                where: { customerId, tailorId },
            });
            if (!room) {
                // Kalau belum ada, buat
                room = yield database_1.prismaClient.roomChat.create({
                    data: {
                        customerId,
                        tailorId
                    },
                });
            }
            return room;
        });
    }
    // 2. Ambil daftar room milik customer
    static getRoomsByCustomer(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('masuk');
            return database_1.prismaClient.roomChat.findMany({
                where: { customerId },
                include: {
                    // opsional: bawa data penjahit
                    tailor: true,
                    // Atau last message, dsb
                }
            });
        });
    }
    // 3. Ambil daftar room milik tailor
    static getRoomsByTailor(tailorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.prismaClient.roomChat.findMany({
                where: { tailorId },
                include: {
                    // opsional: bawa data customer
                    customer: true,
                }
            });
        });
    }
    // 4. Ambil semua chat dalam 1 room
    static getChatsInRoom(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.prismaClient.chat.findMany({
                where: { roomId },
                orderBy: { createdAt: "asc" }
            });
        });
    }
    // 5. Kirim pesan (disimpan di tabel Chat)
    static sendMessage(roomId, senderId, senderType, message, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.prismaClient.chat.create({
                data: {
                    roomId,
                    senderId,
                    senderType,
                    message,
                    type
                }
            });
        });
    }
}
exports.ChatService = ChatService;
