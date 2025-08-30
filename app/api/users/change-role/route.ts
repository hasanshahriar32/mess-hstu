import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")
    const user = verifyToken(token)
    if (!user || user.role !== "owner") {
      return NextResponse.json({ success: false, error: "Forbidden: Only owner can change roles" }, { status: 403 })
    }
    const { userId, newRole } = await req.json()
    if (!userId || !newRole) {
      return NextResponse.json({ success: false, error: "Missing userId or newRole" }, { status: 400 })
    }
    if (!['owner', 'user'].includes(newRole)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }
    const result = await sql`
      UPDATE users SET role = ${newRole} WHERE id = ${userId} RETURNING id, name, email, role
    `
    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, user: result[0] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to change role" }, { status: 500 })
  }
}
