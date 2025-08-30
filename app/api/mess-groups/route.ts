import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("=== API GET /api/mess-groups START ===")

    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    const category = searchParams.get("category")

    console.log("Query params:", { location, category })

    // Test database connection first
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

    // Build query with filters
    let query = `
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
        u.email as owner_email
      FROM mess_groups mg
      LEFT JOIN users u ON mg.owner_id = u.id
      WHERE mg.is_active = true
    `

    const params: any[] = []
    let paramIndex = 1

    if (location) {
      query += ` AND mg.location = $${paramIndex}`
      params.push(location)
      paramIndex++
    }

    if (category) {
      query += ` AND mg.category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    query += ` ORDER BY mg.created_at DESC`

    console.log("Executing query:", query)
    console.log("With params:", params)

    // Execute query using Neon's tagged template syntax
    let result
    if (params.length === 0) {
      result = await sql`
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
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true
        ORDER BY mg.created_at DESC
      `
    } else if (location && !category) {
      result = await sql`
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
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true AND mg.location = ${location}
        ORDER BY mg.created_at DESC
      `
    } else if (!location && category) {
      result = await sql`
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
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true AND mg.category = ${category}
        ORDER BY mg.created_at DESC
      `
    } else {
      result = await sql`
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
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true AND mg.location = ${location} AND mg.category = ${category}
        ORDER BY mg.created_at DESC
      `
    }

    console.log(`Found ${result.length} mess groups`)

    // Process the results
    const messGroups = result.map((row: any) => ({
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
      },
    }))

    return NextResponse.json(
      {
        success: true,
        data: messGroups,
        count: messGroups.length,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("API Error in GET /api/mess-groups:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch mess groups",
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

export async function POST(request: NextRequest) {
  try {
    console.log("=== API POST /api/mess-groups START ===")

    const body = await request.json()
    const {
      name,
      description,
      location,
      category,
      price_per_month,
      capacity,
      available_seats,
      single_seats,
      single_price,
      double_seats,
      double_price,
      contact_phone,
      contact_email,
      address,
      amenities,
      images,
      owner_id,
    } = body

    console.log("Creating mess group:", name)

    // Validate required fields
    if (!name || !location || !category || !price_per_month || !capacity) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, location, category, price, and capacity are required",
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

    // Create mess group
    const result = await sql`
      INSERT INTO mess_groups (
        name, description, location, category, price_per_month, capacity, 
        available_seats, single_seats, single_price, double_seats, double_price, contact_phone, contact_email, address, amenities, 
        images, owner_id, is_active
      )
      VALUES (
        ${name}, ${description || ""}, ${location}, ${category}, ${price_per_month}, 
        ${capacity}, ${available_seats || capacity}, ${single_seats || 0}, ${single_price || 0}, ${double_seats || 0}, ${double_price || 0}, ${contact_phone || ""}, 
        ${contact_email || ""}, ${address || ""}, ${JSON.stringify(amenities || [])}, 
        ${JSON.stringify(images || [])}, ${owner_id || null}, true
      )
      RETURNING *
    `

    const messGroup = result[0]
    console.log("Mess group created successfully:", messGroup.id)

    return NextResponse.json(
      {
        success: true,
        message: "Mess group created successfully",
        data: {
          id: messGroup.id,
          name: messGroup.name,
          description: messGroup.description,
          location: messGroup.location,
          category: messGroup.category,
          price_per_month: Number.parseFloat(messGroup.price_per_month),
          capacity: messGroup.capacity,
          available_seats: messGroup.available_seats,
          single_seats: messGroup.single_seats,
          single_price: Number.parseFloat(messGroup.single_price),
          double_seats: messGroup.double_seats,
          double_price: Number.parseFloat(messGroup.double_price),
          contact_phone: messGroup.contact_phone,
          contact_email: messGroup.contact_email,
          address: messGroup.address,
          amenities: messGroup.amenities,
          images: messGroup.images,
          created_at: messGroup.created_at,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("API Error in POST /api/mess-groups:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create mess group",
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
