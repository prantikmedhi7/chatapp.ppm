"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/LoginForm"
import ChatLayout from "@/components/ChatLayout"
import { getCurrentUser, setCurrentUser, clearCurrentUser } from "@/lib/auth"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = async (username: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentUser(data.user)
        setIsLoggedIn(true)
      } else {
        setError(data.error || "Failed to login")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const user = getCurrentUser()
    if (user) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        })
      } catch (error) {
        console.error("Logout error:", error)
      }
    }

    clearCurrentUser()
    setIsLoggedIn(false)
    setError(null)
  }

  if (isLoggedIn) {
    return <ChatLayout onLogout={handleLogout} />
  }

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />
}
