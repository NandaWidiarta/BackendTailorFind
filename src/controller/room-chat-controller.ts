import { NextFunction, Request, Response } from "express";
import { ChatService } from "../service/chat-service";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabase-client";
import { Role } from "@prisma/client";


export class RoomChatController {
  static async createOrGetRoom(req: Request, res: Response) {
    try {
      const { customerId, tailorId } = req.body
      const room = await ChatService.createOrGetRoom(customerId, tailorId)
      res.json(room)
    } catch (e) {
        res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  // Ambil daftar room milik customer
  static async getRoomsByCustomer(req: Request, res: Response) {
    try {
        console.log("masuk controller try")
      const customerId = req.params.customerId
      const rooms = await ChatService.getRoomsByCustomer(customerId)
      res.json(rooms)
    } catch (e) {
        console.log("masuk controller catch")
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  // Ambil daftar room milik tailor
  static async getRoomsByTailor(req: Request, res: Response) {
    try {
      const tailorId = req.params.tailorId
      const rooms = await ChatService.getRoomsByTailor(tailorId)
      res.json(rooms)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  // Ambil semua chat di room
  static async getChatsInRoomByTailor(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId
      const chats = await ChatService.getChatsInRoom(roomId, Role.TAILOR)
      res.json(chats)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  static async getChatsInRoomByCustomer(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId
      const chats = await ChatService.getChatsInRoom(roomId, Role.CUSTOMER)
      res.json(chats)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  // Kirim pesan (opsional, jika pakai HTTP)
  static async sendMessage(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId
      const { senderId, senderType, message, type } = req.body
      const chat = await ChatService.sendMessage(roomId, senderId, senderType, message, type)
      res.json(chat)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  static async sendMessageV2(req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = req.params.roomId
      const { senderId, senderType, message, type } = req.body
      const file = req.file

      let finalMessage = message
      let finalType = type

      console.log('masuk sendMessageV2')

      if (file) {
        const publicURL = await uploadFileToSupabase(file, roomId)
        if (!publicURL) {
          res
            .status(500)
            .json({ error: 'Failed to upload file to Supabase' })
        }

        finalMessage = publicURL
        finalType = 'image'
      }

      const chat = await ChatService.sendMessage(roomId, senderId, senderType, finalMessage, finalType)
      
      res.status(200).json({
        data: chat,
    });
    } catch (e) {
      next(e)
    }
  }

}

function getErrorMessage(e: unknown): string {
    if (e instanceof Error) {
        return e.message;
    }
    return 'An unknown error occurred';
}

async function uploadFileToSupabase(
  file: Express.Multer.File,
  roomId: string
): Promise<string | null> {
  try {
    const extension = file.originalname.split('.').pop();
    const fileName = `${uuid()}-${Date.now()}.${extension || ''}`;
    const path = `${roomId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false, 
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    let publicURL: string | null = null;
    if (data && data.path) {
      const { data: publicData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);
      publicURL = publicData?.publicUrl ?? null;
    }

    return publicURL;
  } catch (err) {
    console.error('Exception uploading to Supabase:', err);
    return null;
  }
}
