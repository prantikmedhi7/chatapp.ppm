"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getPusherClient } from "@/lib/pusher"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import UsersList from "./UsersList"
import { Button } from "@/components/ui/button"
import { LogOut, Wifi, WifiOff, Copy, Check } from "lucide-react"

interface Message {
  id: string
  sender: string
  content: string
  createdAt: string
}

interface ChatRoomProps {
  username: string
  roomId: string
  onLeaveRoom: () => void
}

export default function ChatRoom({ username, roomId, onLeaveRoom }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [activeUsers, setActiveUsers] = useState<string[]>([username])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Use a ref to track the pusher client and channel
  const pusherClientRef = useRef<any>(null)
  const channelRef = useRef<any>(null)

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages?roomId=${roomId}`)
        const data = await response.json()
        if (data.messages) {
          setMessages(data.messages)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [roomId])

  // Set up Pusher subscriptions
  useEffect(() => {
    console.log("Setting up Pusher connection for room:", roomId)

    // Initialize Pusher client
    const pusherClient = getPusherClient()
    if (!pusherClient) {
      console.error("Failed to initialize Pusher client")
      setConnectionError("Failed to initialize chat connection")
      return
    }

    pusherClientRef.current = pusherClient

    // Subscribe to the channel
    const channelName = `room-${roomId}`
    const channel = pusherClient.subscribe(channelName)
    channelRef.current = channel

    console.log(`Subscribed to channel: ${channelName}`)

    // Connection status
    const handleConnected = () => {
      console.log("Pusher connected successfully")
      setConnected(true)
      setConnectionError(null)
    }

    const handleDisconnected = () => {
      console.log("Pusher disconnected")
      setConnected(false)
    }

    const handleError = (err: any) => {
      console.error("Pusher connection error:", err)
      setConnected(false)
      setConnectionError(`Connection error: ${err.message || "Unknown error"}`)
    }

    // Bind connection events
    pusherClient.connection.bind("connected", handleConnected)
    pusherClient.connection.bind("disconnected", handleDisconnected)
    pusherClient.connection.bind("error", handleError)

    // Check if already connected
    if (pusherClient.connection.state === "connected") {
      handleConnected()
    }

    // Listen for new messages
    channel.bind("new-message", (data: Message) => {
      console.log("Received new message:", data)
      setMessages((prev) => [...prev, data])
    })

    // Listen for typing events
    channel.bind("typing", (data: { username: string; isTyping: boolean }) => {
      console.log("Typing event:", data)
      if (data.username !== username) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.username) ? prev : [...prev, data.username]
          } else {
            return prev.filter((user) => user !== data.username)
          }
        })
      }
    })

    // Simulate active users joining
    const addUserToRoom = () => {
      setActiveUsers((prev) => {
        if (!prev.includes(username)) {
          return [...prev, username]
        }
        return prev
      })
    }

    addUserToRoom()

    // Cleanup function
    return () => {
      console.log("Cleaning up Pusher subscriptions")

      // Unbind events
      if (pusherClient) {
        pusherClient.connection.unbind("connected", handleConnected)
        pusherClient.connection.unbind("disconnected", handleDisconnected)
        pusherClient.connection.unbind("error", handleError)

        // Unsubscribe from channel
        if (channel) {
          channel.unbind_all()
          pusherClient.unsubscribe(channelName)
        }
      }
    }
  }, [roomId, username])

  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        const response = await fetch("/api/send-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: username,
            content,
            roomId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }
      } catch (error) {
        console.error("Error sending message:", error)
        // Add message locally as fallback
        const fallbackMessage: Message = {
          id: Math.random().toString(36).substring(7),
          sender: username,
          content,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, fallbackMessage])
      }
    },
    [username, roomId],
  )

  const handleTyping = useCallback(
    async (isTyping: boolean) => {
      if (!connected) return // Don't send typing events if not connected

      try {
        await fetch("/api/typing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            roomId,
            isTyping,
          }),
        })
      } catch (error) {
        console.error("Error sending typing status:", error)
      }
    },
    [username, roomId, connected],
  )

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy room ID:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading chat room...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white text-xl font-bold">Room: {roomId}</h1>
                <Button onClick={copyRoomId} size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                {connected ? (
                  <Wifi className="h-4 w-4 text-green-500" title="Connected" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" title="Disconnected" />
                )}
              </div>
              <p className="text-gray-400 text-sm">Welcome, {username}!</p>
            </div>
          </div>
          <Button onClick={onLeaveRoom} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <LogOut className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
        </div>

        {!connected && (
          <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm">
            ⚠️ Connection lost. {connectionError || "Check your internet or Pusher configuration."}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} currentUser={username} typingUsers={typingUsers} />
          <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} disabled={!connected} />
        </div>
        <UsersList users={activeUsers} currentUser={username} />
      </div>
    </div>
  )
}
