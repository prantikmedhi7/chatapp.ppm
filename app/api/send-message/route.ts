import { type NextRequest, NextResponse } from "next/server"
import { roomStorage } from "@/lib/storage"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const { sender, content, roomId } = await request.json()

    if (!sender || !content || !roomId) {
      return NextResponse.json({ error: "Sender, content, and room ID are required" }, { status: 400 })
    }

    // Check if room exists
    const room = roomStorage.findRoom(roomId)
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Save message to in-memory storage
    const message = roomStorage.addMessage(roomId, sender, content)

    // Broadcast message via Pusher
    await pusherServer.trigger(`room-${roomId}`, "new-message", {
      id: message.id,
      sender: message.sender,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
