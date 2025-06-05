import { type NextRequest, NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const { username, roomId, isTyping } = await request.json()

    if (!username || !roomId) {
      return NextResponse.json({ error: "Username and room ID are required" }, { status: 400 })
    }

    // Broadcast typing status via Pusher
    await pusherServer.trigger(`room-${roomId}`, "typing", {
      username,
      isTyping,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error broadcasting typing status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
