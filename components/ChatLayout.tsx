"use client"

import { useState, useEffect } from "react"
import { getPusherClient } from "@/lib/pusher"
import { getCurrentUser } from "@/lib/auth"
import Sidebar from "./Sidebar"
import ChatWindow from "./ChatWindow"
import UserSearch from "./UserSearch"

interface User {
  id: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

interface Conversation {
  id: string
  type: string
  name?: string
  participant?: User
  lastMessage?: {
    content: string
    sender: string
    createdAt: string
  }
  updatedAt: string
}

interface ChatLayoutProps {
  onLogout: () => void
}

export default function ChatLayout({ onLogout }: ChatLayoutProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(true)

  const currentUser = getCurrentUser()

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await fetch(`/api/conversations?userId=${currentUser.id}`)
        const data = await response.json()
        if (data.conversations) {
          setConversations(data.conversations)
        }
      } catch (error) {
        console.error("Error loading conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      loadConversations()
    }
  }, [currentUser])

  // Set up Pusher subscriptions
  useEffect(() => {
    if (!currentUser) return

    const pusherClient = getPusherClient()
    if (!pusherClient) return

    const userChannel = pusherClient.subscribe(`user-${currentUser.id}`)

    // Listen for new messages
    userChannel.bind("new-message", (data: any) => {
      // Refresh conversations to update last message
      loadConversations()
    })

    // Listen for friend requests
    userChannel.bind("friend-request", (data: any) => {
      // You can show a notification here
      console.log("New friend request:", data)
    })

    // Listen for accepted friend requests
    userChannel.bind("friend-accepted", (data: any) => {
      // Refresh conversations
      loadConversations()
    })

    const loadConversations = async () => {
      try {
        const response = await fetch(`/api/conversations?userId=${currentUser.id}`)
        const data = await response.json()
        if (data.conversations) {
          setConversations(data.conversations)
        }
      } catch (error) {
        console.error("Error loading conversations:", error)
      }
    }

    return () => {
      pusherClient.unsubscribe(`user-${currentUser.id}`)
    }
  }, [currentUser])

  const handleStartConversation = async (friendId: string) => {
    try {
      const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId,
        }),
      })

      const data = await response.json()
      if (data.conversationId) {
        setActiveConversation(data.conversationId)
        setShowSearch(false)
        // Refresh conversations
        const convResponse = await fetch(`/api/conversations?userId=${currentUser.id}`)
        const convData = await convResponse.json()
        if (convData.conversations) {
          setConversations(convData.conversations)
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading your chats...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onShowSearch={() => setShowSearch(true)}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      {showSearch ? (
        <UserSearch
          onClose={() => setShowSearch(false)}
          onStartConversation={handleStartConversation}
          currentUser={currentUser}
        />
      ) : activeConversation ? (
        <ChatWindow conversationId={activeConversation} currentUser={currentUser} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to ChatApp</h2>
            <p className="text-gray-400 mb-6">Select a conversation or search for friends to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
