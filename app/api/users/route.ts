import { NextRequest, NextResponse } from "next/server"
import { getAllUsers } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    console.log("Authorization header:", authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")
    const user = verifyToken(token)
    if (!user || user.role !== "owner") {
      return NextResponse.json({ success: false, error: "Forbidden: Only owner can access" }, { status: 403 })
    }
    // Query all users
    const users = await getAllUsers()
    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch users" }, { status: 500 })
  }
}
