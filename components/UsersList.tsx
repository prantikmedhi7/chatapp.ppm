"use client"

import { Users, Crown } from "lucide-react"

interface UsersListProps {
  users: string[]
  currentUser: string
  roomCreator?: string
}

export default function UsersList({ users, currentUser, roomCreator }: UsersListProps) {
  return (
    <div className="w-64 bg-gray-900 border-l border-gray-800 p-4 hidden md:block">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-gray-400" />
        <h3 className="text-white font-semibold">Online ({users.length})</h3>
      </div>
      <div className="space-y-2">
        {users.map((user, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-2 rounded ${
              user === currentUser ? "bg-blue-600/20 text-blue-400" : "text-gray-300"
            }`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm flex-1">
              {user} {user === currentUser && "(You)"}
            </span>
            {user === roomCreator && <Crown className="h-3 w-3 text-yellow-500" title="Room Creator" />}
          </div>
        ))}
      </div>
    </div>
  )
}
