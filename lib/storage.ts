// Simple in-memory storage for rooms and messages
interface Room {
  roomId: string
  password: string
  createdBy: string
  createdAt: Date
}

interface Message {
  id: string
  sender: string
  content: string
  roomId: string
  createdAt: Date
}

// In-memory storage
const rooms = new Map<string, Room>()
const messages = new Map<string, Message[]>()

export const roomStorage = {
  // Create a new room
  createRoom: (roomId: string, password: string, createdBy: string): Room => {
    const room: Room = {
      roomId,
      password,
      createdBy,
      createdAt: new Date(),
    }
    rooms.set(roomId, room)
    messages.set(roomId, [])
    console.log(`Room created: ${roomId} by ${createdBy}`)
    return room
  },

  // Find an existing room
  findRoom: (roomId: string): Room | undefined => {
    return rooms.get(roomId)
  },

  // Get all rooms (for debugging)
  getAllRooms: (): Room[] => {
    return Array.from(rooms.values())
  },

  // Add a message to a room
  addMessage: (roomId: string, sender: string, content: string): Message => {
    const message: Message = {
      id: Math.random().toString(36).substring(7),
      sender,
      content,
      roomId,
      createdAt: new Date(),
    }

    const roomMessages = messages.get(roomId) || []
    roomMessages.push(message)
    messages.set(roomId, roomMessages)

    return message
  },

  // Get all messages for a room
  getMessages: (roomId: string): Message[] => {
    return messages.get(roomId) || []
  },
}
