import { type NextRequest, NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const socketId = formData.get("socket_id") as string
    const channel = formData.get("channel_name") as string

    if (!socketId || !channel) {
      return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 })
    }

    // For presence channels, we need to provide user info
    const presenceData = {
      user_id: Math.random().toString(36).substring(7),
      user_info: {
        name: "User",
      },
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel, presenceData)

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error("Error authorizing Pusher:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
