"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getPusherClient } from "@/lib/pusher"

export default function ConnectionDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const checkConnection = async () => {
    setLoading(true)
    try {
      // Get server environment info
      const response = await fetch("/api/debug")
      const serverInfo = await response.json()

      // Get client-side Pusher info
      const pusherClient = getPusherClient()
      const clientInfo = {
        connectionState: pusherClient?.connection.state || "not initialized",
        socketId: pusherClient?.connection.socket_id || "none",
        timeline: pusherClient?.connection.timeline?.slice(-5) || [],
      }

      setDebugInfo({
        server: serverInfo,
        client: clientInfo,
        browser: {
          userAgent: navigator.userAgent,
          online: navigator.onLine,
        },
      })
    } catch (error) {
      console.error("Debug error:", error)
      setDebugInfo({ error: "Failed to get debug info" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <Button
        onClick={() => {
          setShowDebug(!showDebug)
          if (!debugInfo) checkConnection()
        }}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        {showDebug ? "Hide Debug Info" : "Show Debug Info"}
      </Button>

      {showDebug && (
        <div className="mt-2 p-3 bg-gray-800 rounded-lg text-xs font-mono overflow-auto max-h-60">
          {loading ? (
            <p>Loading debug info...</p>
          ) : debugInfo ? (
            <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
          ) : (
            <p>Click "Check Connection" to debug</p>
          )}

          <Button onClick={checkConnection} variant="secondary" size="sm" className="mt-2 text-xs" disabled={loading}>
            Refresh Debug Info
          </Button>
        </div>
      )}
    </div>
  )
}
