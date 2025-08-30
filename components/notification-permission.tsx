"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, X } from "lucide-react"

export function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if notifications are supported and not already granted
    if ("Notification" in window && Notification.permission === "default") {
      // Show prompt after a delay
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 5000) // Show after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        new Notification("HSTU Mess Finder", {
          body: "You'll now receive notifications about new mess listings and updates!",
          icon: "/icon-192x192.png",
        })
      }
    }
    setShowPrompt(false)
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="font-semibold text-slate-800">Stay Updated</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Get notified about new mess listings and important updates.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={requestPermission}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Allow
            </Button>
            <Button size="sm" variant="outline" onClick={dismissPrompt}>
              Not now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
