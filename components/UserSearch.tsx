"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, UserPlus, Check } from "lucide-react"
import { generateAvatar } from "@/lib/auth"

interface User {
  id: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

interface UserSearchProps {
  onClose: () => void
  onStartConversation: (friendId: string) => void
  currentUser: User
}

export default function UserSearch({ onClose, onStartConversation, currentUser }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())

  // Load friends
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const response = await fetch(`/api/friends/list?userId=${currentUser.id}`)
        const data = await response.json()
        if (data.friends) {
          setFriends(data.friends)
        }
      } catch (error) {
        console.error("Error loading friends:", error)
      }
    }

    loadFriends()
  }, [currentUser.id])

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&userId=${currentUser.id}`)
        const data = await response.json()
        if (data.users) {
          setSearchResults(data.users)
        }
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, currentUser.id])

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterId: currentUser.id,
          receiverId: userId,
        }),
      })

      if (response.ok) {
        setSentRequests((prev) => new Set([...prev, userId]))
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  const isFriend = (userId: string) => {
    return friends.some((friend) => friend.id === userId)
  }

  const hasRequestSent = (userId: string) => {
    return sentRequests.has(userId)
  }

  return (
    <div className="flex-1 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Find Friends</h2>
        <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for users by username..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Friends Section */}
        {friends.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-300 font-semibold mb-3">Your Friends</h3>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${generateAvatar(friend.username)}`}
                      >
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{friend.username}</p>
                      <p className="text-gray-400 text-sm">{friend.isOnline ? "Online" : "Offline"}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onStartConversation(friend.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Message
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery.trim().length >= 2 && (
          <div>
            <h3 className="text-gray-300 font-semibold mb-3">Search Results</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${generateAvatar(user.username)}`}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-400 text-sm">{user.isOnline ? "Online" : "Offline"}</p>
                      </div>
                    </div>
                    <div>
                      {isFriend(user.id) ? (
                        <Button
                          onClick={() => onStartConversation(user.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Message
                        </Button>
                      ) : hasRequestSent(user.id) ? (
                        <Button disabled className="bg-gray-600 text-gray-300">
                          <Check className="h-4 w-4 mr-2" />
                          Sent
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSendFriendRequest(user.id)}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {searchQuery.trim().length < 2 && friends.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-white text-xl font-bold mb-2">Find Your Friends</h3>
            <p className="text-gray-400 mb-4">Search for users by their username to send friend requests</p>
            <p className="text-gray-500 text-sm">Type at least 2 characters to start searching</p>
          </div>
        )}
      </div>
    </div>
  )
}
