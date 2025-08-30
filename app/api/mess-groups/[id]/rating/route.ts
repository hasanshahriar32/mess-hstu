import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context
    const id = params?.id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid mess group ID" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    const body = await request.json()
    const { rating } = body
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a number between 0 and 5" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    const result = await sql`UPDATE mess_groups SET rating = ${rating} WHERE id = ${Number(id)} RETURNING *`
    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mess group not found" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }
    return NextResponse.json(
      { success: true, message: "Rating updated successfully", data: result[0] },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("API Error in PATCH /api/mess-groups/[id]/rating:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update rating", details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
