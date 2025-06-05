"use client"

import { useEffect, useRef } from "react"

interface Message {
  id: string
  sender: string
  content: string
  createdAt: string
}

interface MessageListProps {
  messages: Message[]
  currentUser: string
  typingUsers: string[]
}

export default function MessageList({ messages, currentUser, typingUsers }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUsers])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-lg">Welcome to the chat room! 👋</p>
          <p className="text-sm mt-2">Start the conversation by sending a message below.</p>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === currentUser ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
            }`}
          >
            {message.sender !== currentUser && <div className="text-xs text-gray-400 mb-1">{message.sender}</div>}
            <div className="break-words whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs opacity-70 mt-1">{formatTime(message.createdAt)}</div>
          </div>
        </div>
      ))}

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
  )
}
