import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const { requesterId, receiverId } = await request.json()

    if (!requesterId || !receiverId) {
      return NextResponse.json({ error: "Requester and receiver IDs are required" }, { status: 400 })
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    })

    if (existingFriendship) {
      return NextResponse.json({ error: "Friendship request already exists" }, { status: 400 })
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        receiverId,
        status: "PENDING",
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    // Notify the receiver via Pusher
    await pusherServer.trigger(`user-${receiverId}`, "friend-request", {
      friendship,
    })

    return NextResponse.json({ success: true, friendship })
  } catch (error) {
    console.error("Friend request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
