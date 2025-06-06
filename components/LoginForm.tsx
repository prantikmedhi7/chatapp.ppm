"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MessageCircle } from "lucide-react"

interface LoginFormProps {
  onLogin: (username: string) => void
  loading: boolean
  error: string | null
}

export default function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onLogin(username.trim())
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to ChatApp</CardTitle>
          <p className="text-gray-400">Enter your username to start chatting</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                required
                minLength={2}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Signing in..." : "Start Chatting"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-gray-300 text-sm font-semibold mb-2">How it works:</h3>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Enter any username to create or login to your account</li>
              <li>• Search for other users to send friend requests</li>
              <li>• Chat with your friends in real-time</li>
              <li>• Your conversations are saved automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
