"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, Users, List, Menu, X, LogOut } from "lucide-react"
import { logout } from "@/lib/auth-utils"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Home },
  { label: "Bookings", href: "/admin/bookings", icon: List },
  { label: "Users", href: "/admin/users", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null)
  const router = useRouter()
  useEffect(() => {
    if (typeof window === "undefined") return
    const userData = localStorage.getItem("user")
    if (!userData) {
      setIsOwner(false)
      router.replace("/")
      return
    }
    try {
      const user = JSON.parse(userData)
      if (user.role === "owner") {
        setIsOwner(true)
        // If already on /admin/*, do nothing, else redirect to dashboard
        if (!window.location.pathname.startsWith("/admin")) {
          router.replace("/admin/dashboard")
        }
      } else {
        setIsOwner(false)
        router.replace("/user")
      }
    } catch {
      setIsOwner(false)
      router.replace("/")
    }
  }, [router])

  if (isOwner === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <span className="text-2xl font-bold text-orange-600">Checking access...</span>
        </div>
      </div>
    )
  }
  if (!isOwner) {
    // While redirecting, show nothing
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}

function AdminSidebar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  // On mobile, show a full-screen overlay with the sidebar when open
  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`h-screen sticky top-0 z-50 flex flex-col bg-white/90 border-r border-slate-200 shadow-sm w-16 sm:w-56 transition-all duration-200
        ${open ? "fixed left-0 top-0 w-48 h-full sm:static sm:w-56" : ""}`}
        style={{ minWidth: open ? 180 : 64 }}
      >
        {/* Mobile toggle */}
        <div className="sm:hidden flex items-center justify-between px-2 py-3 border-b border-slate-100">
          <button onClick={() => setOpen((v) => !v)} className="p-2 rounded hover:bg-slate-100">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Nav links */}
        <nav className={`flex-1 flex flex-col gap-2 py-4 ${open ? "" : "sm:gap-2"} ${open ? "" : "sm:items-start items-center"}`}
          style={{ minWidth: open ? 180 : 64 }}>
          {navItems.map(({ label, href, icon: Icon }) => (
            <button
              key={href}
              onClick={() => { router.push(href); setOpen(false) }}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-orange-50 transition-colors w-full
                ${open || typeof window !== "undefined" && window.innerWidth >= 640 ? "justify-start" : "justify-center"}`}
              title={label}
            >
              <Icon className="w-6 h-6 text-orange-600" />
              <span className={`text-slate-800 font-medium text-base ${open || typeof window !== "undefined" && window.innerWidth >= 640 ? "inline" : "hidden sm:inline"}`}>{label}</span>
            </button>
          ))}
          {/* Logout button */}
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors w-full mt-auto mb-4
              ${open || typeof window !== "undefined" && window.innerWidth >= 640 ? "justify-start" : "justify-center"}`}
            title="Logout"
          >
            <LogOut className="w-6 h-6 text-red-600" />
            <span className={`text-red-600 font-medium text-base ${open || typeof window !== "undefined" && window.innerWidth >= 640 ? "inline" : "hidden sm:inline"}`}>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  )
}
