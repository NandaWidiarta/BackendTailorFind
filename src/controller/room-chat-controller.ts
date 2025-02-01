import { Request, Response } from "express";
import { ChatService } from "../service/chat-service";


export class RoomChatController {
  // Buat atau ambil room 1–1 antara customer & tailor
  static async createOrGetRoom(req: Request, res: Response) {
    try {
      const { customerId, tailorId } = req.body; // misal { customerId: 10, tailorId: 5 }
      const room = await ChatService.createOrGetRoom(customerId, tailorId);
      res.json(room);
    } catch (e) {
        res.status(500).json({ error: getErrorMessage(e) });
    }
  }

  // Ambil daftar room milik customer
  static async getRoomsByCustomer(req: Request, res: Response) {
    try {
        console.log("masuk controller try")
      const customerId = parseInt(req.params.customerId);
      const rooms = await ChatService.getRoomsByCustomer(customerId);
      res.json(rooms);
    } catch (e) {
        console.log("masuk controller catch")
      res.status(500).json({ error: getErrorMessage(e) });
    }
  }

  // Ambil daftar room milik tailor
  static async getRoomsByTailor(req: Request, res: Response) {
    try {
      const tailorId = parseInt(req.params.tailorId);
      const rooms = await ChatService.getRoomsByTailor(tailorId);
      res.json(rooms);
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) });
    }
  }

  // Ambil semua chat di room
  static async getChatsInRoom(req: Request, res: Response) {
    try {
      const roomId = parseInt(req.params.roomId);
      const chats = await ChatService.getChatsInRoom(roomId);
      res.json(chats);
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) });
    }
  }

  // Kirim pesan (opsional, jika pakai HTTP)
  static async sendMessage(req: Request, res: Response) {
    try {
      const roomId = parseInt(req.params.roomId);
      const { senderId, senderType, message } = req.body; 
      const chat = await ChatService.sendMessage(roomId, senderId, senderType, message);
      res.json(chat);
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) });
    }
  }

  // Ambil daftar room milik customer
  static async tes(req: Request, res: Response) {
    try {
        console.log("masuk controller try")
      const customerId = 3;
      const rooms = await ChatService.getRoomsByCustomer(customerId);
      res.json(rooms);
    } catch (e) {
        console.log("masuk controller catch")
      res.status(500).json({ error: getErrorMessage(e) });
    }
  }
}

function getErrorMessage(e: unknown): string {
    if (e instanceof Error) {
        return e.message;
    }
    return 'An unknown error occurred';
}
