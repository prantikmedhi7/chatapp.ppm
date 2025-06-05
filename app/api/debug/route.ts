import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Return environment variables for debugging (only public ones)
    return NextResponse.json({
      pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY?.substring(0, 5) + "...",
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      hasAppId: !!process.env.PUSHER_APP_ID,
      hasSecret: !!process.env.PUSHER_SECRET,
      nodeEnv: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
