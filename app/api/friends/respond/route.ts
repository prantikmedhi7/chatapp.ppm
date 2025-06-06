import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const { friendshipId, action, userId } = await request.json()

    if (!friendshipId || !action || !userId) {
      return NextResponse.json({ error: "Friendship ID, action, and user ID are required" }, { status: 400 })
    }

    const friendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: action === "accept" ? "ACCEPTED" : "DECLINED",
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    // If accepted, create a conversation between the two users
    if (action === "accept") {
      const conversation = await prisma.conversation.create({
        data: {
          type: "DIRECT",
          participants: {
            create: [{ userId: friendship.requesterId }, { userId: friendship.receiverId }],
          },
        },
      })

      // Notify both users
      await pusherServer.trigger(`user-${friendship.requesterId}`, "friend-accepted", {
        friendship,
        conversationId: conversation.id,
      })

      await pusherServer.trigger(`user-${friendship.receiverId}`, "friend-accepted", {
        friendship,
        conversationId: conversation.id,
      })
    }

    return NextResponse.json({ success: true, friendship })
  } catch (error) {
    console.error("Friend response error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
