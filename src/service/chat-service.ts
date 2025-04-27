import { Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ChatType } from "../constants/chat-type";
import { ChatResponse, RoomChatResponse } from "../model/chat-model";

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
      where: isCustomer ? { customerId: userId } : { tailorId: userId },
      include: {
        customer: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            profilePicture: true,
            email: true,
            phoneNumber: true,
          }
        },
        tailor: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            profilePicture: true,
            email: true,
            phoneNumber: true,
          }
        }
      }
    });
  
    return rooms.map(room => ({
      id: room.id,
      customerId: room.customerId,
      tailorId: room.tailorId,
      customerName: room.customerName,
      tailorName: room.tailorName,
      latestMessage: room.latestMessage,
      latestMessageTime: room.latestMessageTime,
      unreadCountCustomer: room.unreadCountCustomer,
      unreadCountTailor: room.unreadCountTailor,
      customerProfilePicture: room.customer?.profilePicture ?? null,
      tailorProfilePicture: room.tailor?.profilePicture ?? null,
      createdAt: room.createdAt,
    }));
  }

  async getChatsInRoom(roomId: string, userType: Role): Promise<ChatResponse[]>  {

    if (userType == Role.CUSTOMER) {
      await this.markAsRead(roomId, Role.CUSTOMER);
    } else {
      await this.markAsRead(roomId, Role.TAILOR);
    }

    const chats = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    })
  
    const unreadChatIds = chats
      .filter((chat) => chat.readAt === null && chat.senderType !== userType)
      .map((chat) => chat.id)

    if (unreadChatIds.length > 0) {
      await prismaClient.chat.updateMany({
        where: {
          id: { in: unreadChatIds },
        },
        data: {
          readAt: new Date(),
        },
      })
    }
  
    const updatedChats = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    })

    return updatedChats
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

    await prismaClient.roomChat.update({
      where: { id: roomId },
      data: {
        latestMessage: type == ChatType.TEXT ? message : type,
        latestMessageTime: new Date(),
        unreadCountCustomer: senderType === Role.TAILOR || Role.ADMIN
          ? { increment: 1 } 
          : undefined,
        unreadCountTailor: senderType === Role.CUSTOMER || Role.ADMIN
          ? { increment: 1 }  
          : undefined,
      }
    })
    
    return newChat
  }

  async markAsRead(roomId: string, userType: Role) {
    await prismaClient.roomChat.update({
      where: { id: roomId },
      data: {
        unreadCountCustomer: userType === Role.CUSTOMER ? 0 : undefined,
        unreadCountTailor: userType === Role.TAILOR ? 0 : undefined,
      }
    })
  }

  async deleteRoomChat(roomId: string) {
    await prismaClient.roomChat.delete({
      where: { id: roomId }
    })
  }
  
}
