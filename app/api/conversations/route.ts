import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    const formattedConversations = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find((p) => p.userId !== userId)
      const lastMessage = conversation.messages[0]

      return {
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        participant: otherParticipant?.user,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              sender: lastMessage.sender.username,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: conversation.updatedAt,
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error("Conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
