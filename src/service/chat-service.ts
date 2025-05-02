import { Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ChatType } from "../constants/chat-type";
import { ChatResponse, mapToChatResponse, mapToRoomChatResponse, RoomChatResponse } from "../model/chat-model";

export class ChatService {
  async createOrGetRoom(customerId: string, tailorId: string) : Promise<RoomChatResponse>{
    let room = await prismaClient.roomChat.findFirst({
      where: { customerId, tailorId },
    });

    if (!room) {
      const [customer, tailor] = await Promise.all([
        prismaClient.user.findUnique({ where: { id: customerId } }),
        prismaClient.user.findUnique({ where: { id: tailorId } }),
      ]);
  
      if (!customer || !tailor) {
        throw new Error("Customer or Tailor not found");
      }
  
      room = await prismaClient.roomChat.create({
        data: {
          customerId,
          tailorId,
          customerName: customer.firstname + (customer.lastname ? ` ${customer.lastname}` : ""),
          tailorName: tailor.firstname + (tailor.lastname ? ` ${tailor.lastname}` : ""),
        },
      });
    }
    return room;
  }

  async getRooms(userId: string, role: Role): Promise<RoomChatResponse[]> {
    const isCustomer = role === Role.CUSTOMER;
  
    const rooms = await prismaClient.roomChat.findMany({
      where: {
        ...(isCustomer
          ? { customerId: userId, deletedByCustomer: false }
          : { tailorId: userId, deletedByTailor: false })
      },
      include: {
        customer: { select: { id: true, firstname: true, lastname: true, profilePicture: true, email: true, phoneNumber: true } },
        tailor: { select: { id: true, firstname: true, lastname: true, profilePicture: true, email: true, phoneNumber: true } }
      }
    });
  
    return rooms.map(mapToRoomChatResponse);
  }

  async getChatsInRoom(roomId: string, userType: Role): Promise<ChatResponse[]>  {

    await this.markAsRead(roomId, userType);

    const chats = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    })

    return chats.map(mapToChatResponse);
  }

  async sendMessage(
    roomId: string,
    senderType: Role,
    message: string,
    type: string
  ) : Promise<ChatResponse> {
    const newChat = await prismaClient.chat.create({
      data: {
        roomId,
        senderType,
        message,
        type
      }
    })

   const roomChat =  await prismaClient.roomChat.update({
      where: { id: roomId },
      data: {
        latestMessage: type == ChatType.TEXT ? message : type,
        latestMessageTime: new Date(),
        unreadCountCustomer: senderType === Role.TAILOR || senderType === Role.ADMIN
          ? { increment: 1 } 
          : undefined,
        unreadCountTailor: senderType === Role.CUSTOMER || senderType === Role.ADMIN
          ? { increment: 1 }  
          : undefined,
      }
    })
    
    return mapToChatResponse(newChat);
  }

  async markAsRead(roomId: string, userType: Role) {
    await prismaClient.roomChat.update({
      where: { id: roomId },
      data: {
        unreadCountCustomer: userType === Role.CUSTOMER ? 0 : undefined,
        unreadCountTailor: userType === Role.TAILOR ? 0 : undefined,
      }
    });
  
    await prismaClient.chat.updateMany({
      where: {
        roomId,
        readAt: null,
        senderType: userType === Role.CUSTOMER ? Role.TAILOR : Role.CUSTOMER,
      },
      data: {
        readAt: new Date(),
      }
    });
  }
  

  async deleteRoomChat(roomId: string, userType: Role) {
    await prismaClient.roomChat.update({
      where: { id: roomId },
      data: {
        deletedByCustomer: userType === Role.CUSTOMER ? true : undefined,
        deletedByTailor: userType === Role.TAILOR ? true : undefined,
      },
    });
  
    const room = await prismaClient.roomChat.findUnique({ where: { id: roomId } });
    if (room?.deletedByCustomer && room?.deletedByTailor) {
      await prismaClient.roomChat.delete({ where: { id: roomId } });
    }
  }
  
}
