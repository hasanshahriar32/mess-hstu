"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, Home, RefreshCw, Building2 } from "lucide-react"

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            You're Offline
          </h1>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            It looks like you've lost your internet connection. Don't worry, you can still browse 
            some cached content or try reconnecting.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center text-slate-500 mb-4">
              <Building2 className="w-5 h-5 mr-2" />
              <span className="font-medium">HSTU Mess Finder</span>
            </div>
            <p className="text-sm text-slate-400">
              Some features may be limited while offline
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
