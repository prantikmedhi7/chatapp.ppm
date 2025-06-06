import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const { content, senderId, conversationId } = await request.json()

    if (!content || !senderId || !conversationId) {
      return NextResponse.json({ error: "Content, sender ID, and conversation ID are required" }, { status: 400 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Get conversation participants to notify them
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    })

    // Broadcast message to all participants
    if (conversation) {
      for (const participant of conversation.participants) {
        await pusherServer.trigger(`user-${participant.userId}`, "new-message", {
          message,
          conversationId,
        })
      }
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
