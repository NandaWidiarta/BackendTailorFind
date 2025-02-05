import { prismaClient } from "../application/database";

export class ChatService {
  // 1. Buat atau ambil room 1–1
  static async createOrGetRoom(customerId: number, tailorId: number) {
    // Cek apakah sudah ada room
    let room = await prismaClient.roomChat.findFirst({
      where: { customerId, tailorId },
    });

    if (!room) {
      // Kalau belum ada, buat
      room = await prismaClient.roomChat.create({
        data: {
          customerId,
          tailorId
        },
      });
    }
    return room;
  }

  // 2. Ambil daftar room milik customer
  static async getRoomsByCustomer(customerId: number) {
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

  // 3. Ambil daftar room milik tailor
  static async getRoomsByTailor(tailorId: number) {
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
    });
  }  

  // 4. Ambil semua chat dalam 1 room
  static async getChatsInRoom(roomId: number) {
    return prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" }
    });
  }

  // 5. Kirim pesan (disimpan di tabel Chat)
  static async sendMessage(
    roomId: number,
    senderId: number,
    senderType: string,
    message: string,
    type: string
  ) {
    console.log(roomId, senderId, senderType, message, type)
    return prismaClient.chat.create({
      data: {
        roomId,
        senderId,
        senderType,
        message,
        type
      }
    });
  }
}
