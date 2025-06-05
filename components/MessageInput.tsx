"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Smile, Send } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

export default function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      onTyping(false)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        setTypingTimeout(null)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    // Handle typing indicator
    if (e.target.value.length > 0) {
      onTyping(true)

      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      const timeout = setTimeout(() => {
        onTyping(false)
      }, 1000)

      setTypingTimeout(timeout)
    } else {
      onTyping(false)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 right-0 z-10">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={300} height={400} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder={disabled ? "Connecting..." : "Type a message..."}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-12"
            disabled={disabled}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!message.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
