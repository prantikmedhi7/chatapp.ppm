"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ConnectionDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const checkConnection = async () => {
    setLoading(true)
    try {
      // Get basic server info without exposing sensitive data
      const response = await fetch("/api/debug")
      const serverInfo = await response.json()

      setDebugInfo({
        server: serverInfo,
        browser: {
          userAgent: navigator.userAgent.substring(0, 50) + "...", // Truncate for privacy
          online: navigator.onLine,
        },
        timestamp: new Date().toISOString(),
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
