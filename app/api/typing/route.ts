import { type NextRequest, NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const { userId, conversationId, isTyping, username } = await request.json()

    if (!userId || !conversationId || !username) {
      return NextResponse.json({ error: "User ID, conversation ID, and username are required" }, { status: 400 })
    }

    // Broadcast typing status to conversation
    await pusherServer.trigger(`conversation-${conversationId}`, "typing", {
      userId,
      username,
      isTyping,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Typing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
