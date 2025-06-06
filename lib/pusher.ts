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
      // Get Pusher config from server
      fetch("/api/pusher-config")
        .then((res) => res.json())
        .then((config) => {
          pusherClient = new PusherClient(config.key, {
            cluster: config.cluster,
            forceTLS: true,
          })
        })
        .catch((error) => {
          console.error("Failed to get Pusher config:", error)
        })
    }
    return pusherClient
  }
  return null
}

// Alternative function that returns a promise for proper initialization
export async function initializePusherClient(): Promise<PusherClient | null> {
  if (typeof window !== "undefined") {
    if (!pusherClient) {
      try {
        const response = await fetch("/api/pusher-config")
        const config = await response.json()

        pusherClient = new PusherClient(config.key, {
          cluster: config.cluster,
          forceTLS: true,
        })
      } catch (error) {
        console.error("Failed to initialize Pusher client:", error)
        return null
      }
    }
    return pusherClient
  }
  return null
}
