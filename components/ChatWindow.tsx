"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { initializePusherClient } from "@/lib/pusher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Smile } from "lucide-react"
import { generateAvatar } from "@/lib/auth"
import dynamic from "next/dynamic"

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface User {
  id: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    username: string
    avatar?: string
  }
}

interface ChatWindowProps {
  conversationId: string
  currentUser: User
}

export default function ChatWindow({ conversationId, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [pusherClient, setPusherClient] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize Pusher client
  useEffect(() => {
    const initPusher = async () => {
      const client = await initializePusherClient()
      setPusherClient(client)
    }
    initPusher()
  }, [])

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/messages?conversationId=${conversationId}`)
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
  }, [conversationId])

  // Set up Pusher subscriptions
  useEffect(() => {
    if (!pusherClient) return

    const userChannel = pusherClient.subscribe(`user-${currentUser.id}`)
    const conversationChannel = pusherClient.subscribe(`conversation-${conversationId}`)

    // Listen for new messages
    userChannel.bind("new-message", (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data.message])
      }
    })

    // Listen for typing events
    conversationChannel.bind("typing", (data: any) => {
      if (data.userId !== currentUser.id) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.username) ? prev : [...prev, data.username]
          } else {
            return prev.filter((user) => user !== data.username)
          }
        })
      }
    })

    return () => {
      if (pusherClient) {
        pusherClient.unsubscribe(`user-${currentUser.id}`)
        pusherClient.unsubscribe(`conversation-${conversationId}`)
      }
    }
  }, [conversationId, currentUser.id, pusherClient])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typingUsers])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    // Clear typing indicator
    handleTyping(false)

    try {
      await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          senderId: currentUser.id,
          conversationId,
        }),
      })
    } catch (error) {
      console.error("Error sending message:", error)
      // Add message back to input on error
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const handleTyping = async (isTyping: boolean) => {
    try {
      await fetch("/api/typing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          conversationId,
          isTyping,
          username: currentUser.username,
        }),
      })
    } catch (error) {
      console.error("Error sending typing status:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    // Handle typing indicator
    if (e.target.value.length > 0) {
      handleTyping(true)

      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      const timeout = setTimeout(() => {
        handleTyping(false)
      }, 1000)

      setTypingTimeout(timeout)
    } else {
      handleTyping(false)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex-1 bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-950 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender.id === currentUser.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender.id === currentUser.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
                }`}
              >
                {message.sender.id !== currentUser.id && (
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${generateAvatar(message.sender.username)}`}
                    >
                      {message.sender.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-400">{message.sender.username}</span>
                  </div>
                )}
                <div className="break-words whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">{formatTime(message.createdAt)}</div>
              </div>
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm animate-pulse">
              <span className="inline-flex items-center">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
                <span className="ml-1 inline-flex">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
                    .
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                    .
                  </span>
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 right-4 z-10">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={300} height={400} />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-12"
                disabled={sending}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!newMessage.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
