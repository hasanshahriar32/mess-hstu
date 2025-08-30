export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid mess group ID" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Optionally: check authentication/authorization here

    // Soft delete: set is_active = false
    const result = await sql`
      UPDATE mess_groups SET is_active = false WHERE id = ${Number(id)} RETURNING id
    `
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mess group not found or already deleted" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }
    return NextResponse.json(
      { success: true, message: "Mess group deleted successfully" },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("API Error in DELETE /api/mess-groups/[id]:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete mess group", details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, context: any) {
  try {
    console.log("=== API GET /api/mess-groups/[id] START ===")

    const { params } = context;
    const id = params.id;
    console.log("Fetching mess group with ID:", id)

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid mess group ID",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Test database connection
    try {
      await sql`SELECT 1 as test`
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Fetch mess group by ID
    const result = await sql`
      SELECT 
        mg.id,
        mg.name,
        mg.description,
        mg.location,
        mg.category,
        mg.price_per_month,
        mg.capacity,
        mg.available_seats,
        mg.single_seats,
        mg.single_price,
        mg.double_seats,
        mg.double_price,
        mg.rating,
        mg.contact_phone,
        mg.contact_email,
        mg.address,
        mg.amenities,
        mg.images,
        mg.created_at,
        u.name as owner_name,
        u.email as owner_email,
        u.mobile as owner_mobile
      FROM mess_groups mg
      LEFT JOIN users u ON mg.owner_id = u.id
      WHERE mg.id = ${Number(id)} AND mg.is_active = true
    `

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Mess group not found",
        },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const row = result[0]
    const messGroup = {
      id: row.id,
      name: row.name,
      description: row.description,
      location: row.location,
      category: row.category,
      price_per_month: Number.parseFloat(row.price_per_month),
      capacity: row.capacity,
      available_seats: row.available_seats,
      single_seats: row.single_seats,
      single_price: Number.parseFloat(row.single_price),
      double_seats: row.double_seats,
      double_price: Number.parseFloat(row.double_price),
      rating: row.rating || 0,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      address: row.address,
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
      images: Array.isArray(row.images) ? row.images : [],
      created_at: row.created_at,
      owner: {
        name: row.owner_name,
        email: row.owner_email,
        mobile: row.owner_mobile,
      },
    }

    console.log("Mess group found:", messGroup.name)

    return NextResponse.json(
      {
        success: true,
        data: messGroup,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("API Error in GET /api/mess-groups/[id]:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch mess group",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
