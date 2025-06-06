"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, Search, Plus, MessageCircle } from "lucide-react"
import { generateAvatar } from "@/lib/auth"

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

interface SidebarProps {
  conversations: Conversation[]
  activeConversation: string | null
  onSelectConversation: (id: string) => void
  onShowSearch: () => void
  onLogout: () => void
  currentUser: User
}

export default function Sidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onShowSearch,
  onLogout,
  currentUser,
}: SidebarProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${generateAvatar(currentUser.username)}`}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-semibold">{currentUser.username}</h2>
              <p className="text-green-400 text-xs">Online</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onShowSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No conversations yet</p>
            <p className="text-gray-500 text-xs mt-1">Start by searching for friends</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                activeConversation === conversation.id ? "bg-gray-800" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      conversation.participant ? generateAvatar(conversation.participant.username) : "bg-gray-600"
                    }`}
                  >
                    {conversation.participant?.username.charAt(0).toUpperCase() || "?"}
                  </div>
                  {conversation.participant?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium truncate">
                      {conversation.participant?.username || "Unknown User"}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-gray-400 text-xs">{formatTime(conversation.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  {conversation.lastMessage ? (
                    <p className="text-gray-400 text-sm truncate">
                      {conversation.lastMessage.sender === currentUser.username ? "You: " : ""}
                      {conversation.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
