import { type NextRequest, NextResponse } from "next/server"
import { roomStorage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { username, roomId, password } = await request.json()

    if (!username || !roomId || !password) {
      return NextResponse.json({ error: "Username, room ID, and password are required" }, { status: 400 })
    }

    // Check if room exists
    const existingRoom = roomStorage.findRoom(roomId)

    if (existingRoom) {
      // Room exists, check password
      if (existingRoom.password !== password) {
        return NextResponse.json({ error: "Invalid password for this room" }, { status: 401 })
      }
      return NextResponse.json({
        success: true,
        roomExists: true,
        message: `Joined existing room created by ${existingRoom.createdBy}`,
      })
    } else {
      // Create new room
      const newRoom = roomStorage.createRoom(roomId, password, username)
      return NextResponse.json({
        success: true,
        roomExists: false,
        message: `Created new room: ${roomId}`,
      })
    }
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
