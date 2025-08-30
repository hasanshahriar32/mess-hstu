"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, User, Shield, CheckCircle, RefreshCw } from "lucide-react"

interface UserType {
  id: number
  name: string
  email: string
  mobile: string
  role: string
  is_approved: boolean
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [roleLoading, setRoleLoading] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (!token || !userData) {
      router.push("/owner/login")
      return
    }
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      if (parsedUser.role !== "owner") {
        router.push("/owner/login")
        return
      }
      fetchUsers(token)
    } catch (error) {
      router.push("/owner/login")
    }
  }, [router])

  const fetchUsers = async (token: string) => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to fetch users")
      setUsers(data.data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Access denied. Owners only.</p>
        </div>
      </div>
    )
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem("token")
    if (!token) return
    setRoleLoading(userId)
    try {
      const res = await fetch("/api/users/change-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newRole }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to change role")
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err: any) {
      setError(err.message || "Failed to change role")
    } finally {
      setRoleLoading(null)
    }
  }

  // Filter users by search (name or email, case-insensitive)
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-slate-800">User Management</span>
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/dashboard")}>Back to Dashboard</Button>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">All Users</h1>
        <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          <input
            type="text"
            className="border border-slate-300 rounded px-3 py-2 w-full sm:w-80 text-base"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading users...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{u.name}</h3>
                      <p className="text-slate-600 text-sm">{u.email}</p>
                      <p className="text-slate-500 text-xs">{u.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                    {u.is_approved ? (
                      <Badge variant="default" className="bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Approved</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    )}
                  </div>
                  {/* Role change dropdown, don't allow changing own role */}
                  {user && user.id !== u.id && (
                    <div className="flex items-center gap-2 mt-4">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={roleLoading === u.id}
                      >
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                      </select>
                      {roleLoading === u.id && <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredUsers.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12">No users found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
