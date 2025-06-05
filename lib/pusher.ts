import Pusher from "pusher"
import PusherClient from "pusher-js"

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance - only initialize on client
let pusherClient: PusherClient

// Create a function to get the client to avoid SSR issues
export function getPusherClient() {
  if (typeof window !== "undefined") {
    if (!pusherClient) {
      pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        forceTLS: true,
      })
    }
    return pusherClient
  }
  return null
}
