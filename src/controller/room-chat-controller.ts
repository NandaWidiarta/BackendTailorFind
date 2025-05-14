import { NextFunction, Request, Response } from "express";
import { ChatService } from "../service/chat-service";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabase-client";
import { Role } from "@prisma/client";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";


export class RoomChatController  {
  constructor ( private readonly chatService: ChatService ) {}
  async createOrGetRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, tailorId } = req.body
      const room = await this.chatService.createOrGetRoom(customerId, tailorId)
      res.status(200).json(room)
    } catch (e) {
      next(e)
    }
  }

  async getAllRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      const userRole = userReq.user?.role;

      if (userId && userRole) {
        const rooms = await this.chatService.getRooms(userId, userRole)
        res.status(200).json(rooms)
      } else {
        throw new ResponseError(400, "User tidak valid");
      }
      
    } catch (e) {
      next(e)
    }
  }

  async getChatsInRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = req.params.roomId
      const userReq = req as UserRequest
      const userRole = userReq.user?.role
  
      if (!userRole) {
        throw new ResponseError(400, "User Tidak Valid")
      }

      const chats = await this.chatService.getChatsInRoom(roomId, userRole)
      res.status(200).json(chats)
    } catch (e) {
      next(e)
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
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
            .json({ error: 'Gagal mengupload gambar ke supabase' })
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

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userRole = userReq.user?.role;
      const { roomId } = req.params

      if (userRole) {
        const rooms = await this.chatService.markAsRead(roomId, userRole)
        res.status(200).json(rooms)
      } else {
        throw new ResponseError(400, "User tidak valid");
      }
      
    } catch (e) {
      next(e)
    }
  }
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
