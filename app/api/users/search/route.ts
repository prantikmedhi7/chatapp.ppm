import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const currentUserId = searchParams.get("userId")

    if (!query || !currentUserId) {
      return NextResponse.json({ error: "Query and user ID are required" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            username: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            id: {
              not: currentUserId,
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 10,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
