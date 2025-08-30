"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User as UserIcon, Mail, Smartphone, Shield } from "lucide-react"

interface UserType {
  id: number
  name: string
  email: string
  mobile: string
  role: string
  is_approved: boolean
}

export default function UserProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.replace("/owner/login")
      return
    }
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch {
      router.replace("/owner/login")
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Please login to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 flex flex-col items-center">
          <UserIcon className="w-16 h-16 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{user.name}</h2>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">{user.mobile}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
            {user.is_approved ? (
              <Badge variant="default" className="bg-green-100 text-green-700">Approved</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
            )}
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  )
}
