import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId, friendId } = await request.json()

    if (!userId || !friendId) {
      return NextResponse.json({ error: "User ID and friend ID are required" }, { status: 400 })
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        participants: {
          every: {
            userId: {
              in: [userId, friendId],
            },
          },
        },
      },
    })

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id })
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: "DIRECT",
        participants: {
          create: [{ userId }, { userId: friendId }],
        },
      },
    })

    return NextResponse.json({ conversationId: conversation.id })
  } catch (error) {
    console.error("Create conversation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
