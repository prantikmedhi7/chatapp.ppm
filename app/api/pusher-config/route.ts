import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return public configuration needed for client
    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    })
  } catch (error) {
    console.error("Pusher config error:", error)
    return NextResponse.json({ error: "Failed to get configuration" }, { status: 500 })
  }
}
