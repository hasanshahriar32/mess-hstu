import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API POST /api/auth/login START ===")

    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
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

    // Find user by email
    const result = await sql`
      SELECT id, name, email, mobile, password_hash, role, is_active
      FROM users 
      WHERE email = ${email.toLowerCase()} AND is_active = true
    `

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const user = result[0]

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log("Login successful for:", user.email)

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
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
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
    console.error("API Error in POST /api/auth/login:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to login",
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
