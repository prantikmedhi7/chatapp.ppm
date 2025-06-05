"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConnectionDebug from "./ConnectionDebug"

interface LoginFormProps {
  onJoinRoom: (username: string, roomId: string, password: string) => void
  loading: boolean
  error: string | null
  successMessage?: string | null
}

export default function LoginForm({ onJoinRoom, loading, error, successMessage }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [roomId, setRoomId] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("join")

  // Load saved data from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem("chat-username")
    if (savedUsername) setUsername(savedUsername)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() && roomId.trim() && password.trim()) {
      onJoinRoom(username.trim(), roomId.trim(), password.trim())
    }
  }

  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(randomId)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Real-Time Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger
                value="join"
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                Join Room
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                Create Room
              </TabsTrigger>
            </TabsList>

            <TabsContent value="join" className="space-y-4 mt-4">
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
                  />
                </div>
                <div>
                  <Label htmlFor="roomId" className="text-gray-300">
                    Room ID
                  </Label>
                  <Input
                    id="roomId"
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="Enter room ID (e.g., ABC123)"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">
                    Room Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                  {loading ? "Joining..." : "Join Room"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="create" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username-create" className="text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username-create"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roomId-create" className="text-gray-300">
                    Room ID
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="roomId-create"
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      placeholder="Room ID"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      required
                    />
                    <Button
                      type="button"
                      onClick={generateRoomId}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="password-create" className="text-gray-300">
                    Room Password
                  </Label>
                  <Input
                    id="password-create"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password for your room"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                  {loading ? "Creating..." : "Create & Join Room"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
              <p className="text-green-400 text-sm text-center">{successMessage}</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-300 text-xs mb-2">💡 How it works:</p>
            <p className="text-gray-400 text-xs mb-1">• Create a room with your own ID and password</p>
            <p className="text-gray-400 text-xs">• Share the Room ID and password with friends to join</p>
          </div>

          <ConnectionDebug />
        </CardContent>
      </Card>
    </div>
  )
}
