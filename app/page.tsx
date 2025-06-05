"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/LoginForm"
import ChatRoom from "@/components/ChatRoom"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [roomId, setRoomId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load saved data from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem("chat-username")
    if (savedUsername) setUsername(savedUsername)
  }, [])

  const handleJoinRoom = async (inputUsername: string, inputRoomId: string, password: string) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/join-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: inputUsername,
          roomId: inputRoomId,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem("chat-username", inputUsername)
        localStorage.setItem("chat-roomId", inputRoomId)

        setUsername(inputUsername)
        setRoomId(inputRoomId)
        setSuccessMessage(data.message)

        // Small delay to show success message
        setTimeout(() => {
          setIsLoggedIn(true)
        }, 1000)
      } else {
        setError(data.error || "Failed to join room")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveRoom = () => {
    setIsLoggedIn(false)
    setUsername("")
    setRoomId("")
    setError(null)
    setSuccessMessage(null)
    // Keep localStorage data for next time
  }

  if (isLoggedIn) {
    return <ChatRoom username={username} roomId={roomId} onLeaveRoom={handleLeaveRoom} />
  }

  return <LoginForm onJoinRoom={handleJoinRoom} loading={loading} error={error} successMessage={successMessage} />
}
