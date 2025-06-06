import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return non-sensitive debug information
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      // Remove any sensitive environment variable exposure
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
