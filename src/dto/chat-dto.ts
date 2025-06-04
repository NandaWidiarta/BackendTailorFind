import { Chat, Role, RoomChat } from "@prisma/client";

export interface RoomChatResponse {
    id: string
    customerId: string
    tailorId: string
    customerName?: string | null
    tailorName?: string | null
    latestMessage?: string | null
    latestMessageTime?: Date | null
    unreadCountCustomer: number
    unreadCountTailor: number
    createdAt: Date
    tailorProfilePicture?: string | null
    customerProfilePicture?: string | null
}

export interface ChatResponse {
    id: string
    roomId: string
    senderType: Role
    message: string
    type: string
    readAt?: Date | null
    createdAt: Date
}

export function mapToRoomChatResponse(room: RoomChat & { customer?: any, tailor?: any }): RoomChatResponse {
    return {
      id: room.id,
      customerId: room.customerId,
      tailorId: room.tailorId,
      customerName: room.customerName ?? null,
      tailorName: room.tailorName ?? null,
      latestMessage: room.latestMessage ?? null,
      latestMessageTime: room.latestMessageTime ?? null,
      unreadCountCustomer: room.unreadCountCustomer ?? 0,
      unreadCountTailor: room.unreadCountTailor ?? 0,
      createdAt: room.createdAt,
      customerProfilePicture: room.customer?.profilePicture ?? null,
      tailorProfilePicture: room.tailor?.profilePicture ?? null,
    }
  }
  
  export function mapToChatResponse(chat: Chat): ChatResponse {
    return {
      id: chat.id,
      roomId: chat.roomId,
      senderType: chat.senderType,
      message: chat.message,
      type: chat.type,
      readAt: chat.readAt ?? null,
      createdAt: chat.createdAt,
    }
  }