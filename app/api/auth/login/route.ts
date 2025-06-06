import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters long" }, { status: 400 })
    }

    const trimmedUsername = username.trim()

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    })

    // If user doesn't exist, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: trimmedUsername,
          isOnline: true,
          lastSeen: new Date(),
        },
      })
    } else {
      // Update user online status
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isOnline: true,
          lastSeen: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        isOnline: user.isOnline,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
