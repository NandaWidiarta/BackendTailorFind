import { Role } from "@prisma/client";

export interface RoomChatResponse {
    id: string;
    customerId: string;
    tailorId: string;
    customerName?: string | null;
    tailorName?: string | null;
    latestMessage?: string | null;
    latestMessageTime?: Date | null;
    unreadCountCustomer: number;
    unreadCountTailor: number;
    createdAt: Date;
    tailorProfilePicture?: string | null
    customerProfilePicture?: string | null
}

export interface ChatResponse {
    id: string;
    roomId: string;
    senderType: Role;
    message: string;
    type: string;
    readAt?: Date | null;
    createdAt: Date;
}