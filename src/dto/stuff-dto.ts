import { StuffCategory } from "@prisma/client";

export interface StuffResponse {
    id: string
    tailorId: string
    name: string
    imageUrl: string
    stuffCaetgory: StuffCategory
    price: number
    createdAt: Date
    updatedAt: Date
}

export function mapToStuffResponse(stuff: any): StuffResponse {
    return {
        id: stuff.id,
        tailorId: stuff.tailorId,
        name: stuff.name,
        imageUrl: stuff.imageUrl,
        stuffCaetgory: stuff.stuffCaetgory,
        price: stuff.price,
        createdAt: stuff.createdAt,
        updatedAt: stuff.updatedAt,
    }
}