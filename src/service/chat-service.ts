import { Role } from "@prisma/client";
import { prismaClient } from "../application/database";

export class ChatService {
  static async createOrGetRoom(customerId: string, tailorId: string) {
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

  static async getRoomsByCustomer(customerId: string) {
    console.log('masuk')
    return prismaClient.roomChat.findMany({
      where: { customerId },
      include: {
        tailor: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true
          }
        },
      }
    });
  }

  static async getRoomsByTailor(tailorId: string) {
    return prismaClient.roomChat.findMany({
      where: { tailorId },
      include: {
        customer: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    })
  }  

  static async getChatsInRoom(roomId: string, userType: Role) {

    if (userType == Role.CUSTOMER) {
      await ChatService.markAsRead(roomId, Role.CUSTOMER);
    } else {
      await ChatService.markAsRead(roomId, Role.TAILOR);
    }

    const chats = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    })
  
    const unreadChatIds = chats
      .filter((chat) => chat.readAt === null && chat.senderType !== userType)
      .map((chat) => chat.id)
  
    console.log('unread count: ', unreadChatIds.length)

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

    // const room = await prismaClient.roomChat.findUnique({
    //   where: { id: roomId },
    //   select: {
    //     unreadCountCustomer: true,
    //     unreadCountTailor: true,
    //   },
    // });

    // const unreadCount =
    // userType === Role.CUSTOMER
    //   ? room?.unreadCountCustomer
    //   : room?.unreadCountTailor;

    // const chats = await prismaClient.chat.findMany({
    //   where: { roomId },
    //   orderBy: { createdAt: "asc" },
    // });

    // return {
    //   chats,
    //   unreadCount,
    // };
  }

  static async sendMessage(
    roomId: string,
    senderId: string,
    senderType: Role,
    message: string,
    type: string
  ) {
    console.log(roomId, senderId, senderType, message, type)
    const newChat = await prismaClient.chat.create({
      data: {
        roomId,
        senderId,
        senderType,
        message,
        type
      }
    })

    await prismaClient.roomChat.update({
      where: { id: roomId },
      data: {
        latestMessage: message,
        latestMessageTime: new Date(),
        unreadCountCustomer: senderType === Role.TAILOR
          ? { increment: 1 } 
          : undefined,
        unreadCountTailor: senderType === Role.CUSTOMER
          ? { increment: 1 }  
          : undefined,
      }
    })
    
    return newChat
  }

  static async markAsRead(roomId: string, userType: Role) {
    await prismaClient.roomChat.update({
      where: { id: roomId },
      data: {
        unreadCountCustomer: userType === Role.CUSTOMER ? 0 : undefined,
        unreadCountTailor: userType === Role.TAILOR ? 0 : undefined,
      }
    })
  }
  
}
