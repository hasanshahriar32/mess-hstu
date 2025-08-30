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
    const fields = [
      "name", "description", "location", "category", "price_per_month", "capacity", "available_seats",
      "single_seats", "single_price", "double_seats", "double_price", "contact_phone", "contact_email", "address", "amenities", "images"
    ]
    const updates = []
    const values = []
    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${updates.length + 2}`)
        values.push(field === "amenities" || field === "images" ? JSON.stringify(body[field]) : body[field])
      }
    }
    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    const query = `UPDATE mess_groups SET ${updates.join(", ")} WHERE id = $1 RETURNING *`
    // Use sql.query for parameterized query with Neon
    const args = [Number(id), ...values]
    const result = await sql.query(query, args)
    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mess group not found" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }
    return NextResponse.json(
      { success: true, message: "Mess group updated successfully", data: result[0] },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("API Error in PATCH /admin/mess-groups/update/[id]:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update mess group", details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
