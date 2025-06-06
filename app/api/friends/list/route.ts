import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    })

    const friends = friendships.map((friendship) => {
      const friend = friendship.requesterId === userId ? friendship.receiver : friendship.requester
      return {
        ...friend,
        friendshipId: friendship.id,
      }
    })

    return NextResponse.json({ friends })
  } catch (error) {
    console.error("Friends list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
