import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API POST /api/auth/register START ===")

    const body = await request.json()
    const { name, email, mobile, password } = body

    console.log("Registration attempt for:", email)

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
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

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await sql`
      INSERT INTO users (name, email, mobile, password_hash, role, is_active)
      VALUES (${name}, ${email.toLowerCase()}, ${mobile || ""}, ${passwordHash}, 'user', true)
      RETURNING id, name, email, mobile, role, created_at
    `

    const user = result[0]
    console.log("User created successfully:", user.email)

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          created_at: user.created_at,
        },
        token,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("API Error in POST /api/auth/register:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to register user",
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
