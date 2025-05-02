import { NextFunction, Request, Response } from "express";
import { ChatService } from "../service/chat-service";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabase-client";
import { Role } from "@prisma/client";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";


export class RoomChatController  {
  constructor ( private readonly chatService: ChatService ) {}
  async createOrGetRoom(req: Request, res: Response) {
    try {
      const { customerId, tailorId } = req.body
      const room = await this.chatService.createOrGetRoom(customerId, tailorId)
      res.json(room)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  async getAllRoom(req: Request, res: Response) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      const userRole = userReq.user?.role;

      if (userId && userRole) {
        const rooms = await this.chatService.getRooms(userId, userRole)
        res.json(rooms)
      } else {
        throw new ResponseError(400, "User tidak valid");
      }
      
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  // Ambil semua chat di room
  async getChatsInRoomByTailor(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId
      const chats = await this.chatService.getChatsInRoom(roomId, Role.TAILOR)
      res.json(chats)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  async getChatsInRoomByCustomer(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId
      const chats = await this.chatService.getChatsInRoom(roomId, Role.CUSTOMER)
      res.json(chats)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId
      const { senderType, message, type } = req.body
      const chat = await this.chatService.sendMessage(roomId, senderType, message, type)
      res.json(chat)
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
    }
  }

  async sendMessageV2(req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = req.params.roomId
      const { senderType, message, type } = req.body
      const file = req.file

      let finalMessage = message
      let finalType = type


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

      const chat = await this.chatService.sendMessage(roomId, senderType, finalMessage, finalType)

      res.status(200).json({
        data: chat,
      })
    } catch (e) {
      next(e)
    }
  }

  async deleteRoomChat(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userRole = userReq.user?.role;
      const { roomId } = req.params

      if (!userRole) {
        throw new ResponseError(400, "User tidak valid");
      }
      
      await this.chatService.deleteRoomChat(roomId, userRole);

      res.status(200).json({
        data: "Berhasil menghapus Room Chat",
      });
    } catch (e) {
      next(e);
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userReq = req as UserRequest;
      const userRole = userReq.user?.role;
      const { roomId } = req.params

      if (userRole) {
        const rooms = await this.chatService.markAsRead(roomId, userRole)
        res.json(rooms)
      } else {
        throw new ResponseError(400, "User tidak valid");
      }
      
    } catch (e) {
      res.status(500).json({ error: getErrorMessage(e) })
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
