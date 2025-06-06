// Simple auth helper functions
export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  }
  return null
}

export function setCurrentUser(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("currentUser", JSON.stringify(user))
  }
}

export function clearCurrentUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
  }
}

export function generateAvatar(username: string) {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  const colorIndex = username.length % colors.length
  return colors[colorIndex]
}
