// Get all bookings (admin)
export async function getAllBookings() {
  try {
    const result = await sql`
      SELECT 
        o.*,
        mg.name as mess_name,
        mg.location,
        mg.category,
        mg.address,
        t.amount,
        t.currency,
        t.status as transaction_status,
        t.payment_method,
        t.created_at as transaction_date
      FROM orders o
      LEFT JOIN mess_groups mg ON o.mess_group_id = mg.id
      LEFT JOIN transactions t ON o.id = t.order_id
      ORDER BY o.created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    throw error;
  }
}
// Helper function to get all users (admin only)
export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, name, email, mobile, role, is_approved
      FROM users
      ORDER BY id ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

// Booking-related helper functions

// Create a new order
export async function createOrder(userId: number, messGroupId: number, roomType: string) {
  try {
    const result = await sql`
      INSERT INTO orders (user_id, mess_group_id, room_type, status)
      VALUES (${userId}, ${messGroupId}, ${roomType}, 'pending')
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

// Create a new transaction
export async function createTransaction(orderId: number, amount: number, stripePaymentIntentId?: string) {
  try {
    const result = await sql`
      INSERT INTO transactions (order_id, amount, currency, status, stripe_payment_intent_id)
      VALUES (${orderId}, ${amount}, 'BDT', 'pending', ${stripePaymentIntentId || null})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

// Update order status
export async function updateOrderStatus(orderId: number, status: string) {
  try {
    const result = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${orderId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

// Update transaction status
export async function updateTransactionStatus(transactionId: number, status: string, paymentMethod?: string) {
  try {
    const result = await sql`
      UPDATE transactions
      SET status = ${status}, 
          payment_method = ${paymentMethod || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${transactionId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error updating transaction status:", error)
    throw error
  }
}

// Get user's orders
export async function getUserOrders(userId: number) {
  try {
    const result = await sql`
      SELECT 
        o.*,
        mg.name as mess_name,
        mg.location,
        mg.category,
        mg.address,
        t.amount,
        t.currency,
        t.status as transaction_status,
        t.payment_method,
        t.created_at as transaction_date
      FROM orders o
      LEFT JOIN mess_groups mg ON o.mess_group_id = mg.id
      LEFT JOIN transactions t ON o.id = t.order_id
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching user orders:", error)
    throw error
  }
}

// Get order by ID
export async function getOrderById(orderId: number) {
  try {
    const result = await sql`
      SELECT 
        o.*,
        mg.name as mess_name,
        mg.location,
        mg.category,
        mg.address,
        t.id as transaction_id,
        t.amount,
        t.currency,
        t.status as transaction_status,
        t.payment_method,
        t.stripe_payment_intent_id
      FROM orders o
      LEFT JOIN mess_groups mg ON o.mess_group_id = mg.id
      LEFT JOIN transactions t ON o.id = t.order_id
      WHERE o.id = ${orderId}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching order by ID:", error)
    throw error
  }
}

// Check if user already has an active booking for a mess
export async function hasActiveBooking(userId: number, messGroupId: number) {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM orders
      WHERE user_id = ${userId} 
        AND mess_group_id = ${messGroupId}
        AND status IN ('pending', 'confirmed', 'paid')
    `
    return result[0].count > 0
  } catch (error) {
    console.error("Error checking active booking:", error)
    throw error
  }
}

// Get available seats for a mess
export async function getAvailableSeats(messGroupId: number) {
  try {
    const messResult = await sql`
      SELECT single_seats, double_seats
      FROM mess_groups
      WHERE id = ${messGroupId}
    `
    
    if (messResult.length === 0) {
      return null
    }

    const totalSeats = messResult[0]
    
    const bookedSeats = await sql`
      SELECT 
        COUNT(CASE WHEN room_type = 'single' THEN 1 END) as booked_single,
        COUNT(CASE WHEN room_type = 'double' THEN 1 END) as booked_double
      FROM orders
      WHERE mess_group_id = ${messGroupId}
        AND status IN ('confirmed', 'paid')
    `
    
    const booked = bookedSeats[0] || { booked_single: 0, booked_double: 0 }
    
    return {
      single_available: totalSeats.single_seats - booked.booked_single,
      double_available: totalSeats.double_seats - booked.booked_double,
      total_single: totalSeats.single_seats,
      total_double: totalSeats.double_seats
    }
  } catch (error) {
    console.error("Error getting available seats:", error)
    throw error
  }
}

// Update mess group available seats (decrement when booking confirmed)
export async function updateMessSeats(messGroupId: number, roomType: string, increment: boolean = false) {

  console.log("Cancel Update Seat")
  try {
    const column = roomType === 'single' ? 'single_seats' : 'double_seats'
    const operator = increment ? '+' : '-'
    
    // const result = await sql`
    //   UPDATE mess_groups
    //   SET ${sql.unsafe(column)} = ${sql.unsafe(column)} ${sql.unsafe(operator)} 1
    //   WHERE id = ${messGroupId}
    //     AND ${sql.unsafe(column)} ${sql.unsafe(increment ? '>= 0' : '> 0')}
    //   RETURNING *
    // `
    // return result[0] || null
    return {};
  } catch (error) {
    console.error("Error updating mess seats:", error)
    throw error
  }
}
import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    console.log("Database connection successful:", result)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Helper function to get mess groups by location and category
export async function getMessGroups(location?: string, category?: string) {
  try {
    if (location && category) {
      const result = await sql`
        SELECT 
          mg.id,
          mg.name,
          mg.location,
          mg.category,
          mg.description,
          mg.single_seats,
          mg.single_price,
          mg.double_seats,
          mg.double_price,
          mg.rating,
          mg.amenities,
          mg.contact_phone,
          mg.contact_email,
          mg.address,
          mg.is_active,
          mg.created_at,
          u.name as owner_name,
          u.mobile as owner_mobile,
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true 
          AND LOWER(mg.location) = LOWER(${location})
          AND LOWER(mg.category) = LOWER(${category})
        ORDER BY mg.rating DESC, mg.created_at DESC
      `
      return result
    } else if (location) {
      const result = await sql`
        SELECT 
          mg.id,
          mg.name,
          mg.location,
          mg.category,
          mg.description,
          mg.single_seats,
          mg.single_price,
          mg.double_seats,
          mg.double_price,
          mg.rating,
          mg.amenities,
          mg.contact_phone,
          mg.contact_email,
          mg.address,
          mg.is_active,
          mg.created_at,
          u.name as owner_name,
          u.mobile as owner_mobile,
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true 
          AND LOWER(mg.location) = LOWER(${location})
        ORDER BY mg.rating DESC, mg.created_at DESC
      `
      return result
    } else if (category) {
      const result = await sql`
        SELECT 
          mg.id,
          mg.name,
          mg.location,
          mg.category,
          mg.description,
          mg.single_seats,
          mg.single_price,
          mg.double_seats,
          mg.double_price,
          mg.rating,
          mg.amenities,
          mg.contact_phone,
          mg.contact_email,
          mg.address,
          mg.is_active,
          mg.created_at,
          u.name as owner_name,
          u.mobile as owner_mobile,
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true 
          AND LOWER(mg.category) = LOWER(${category})
        ORDER BY mg.rating DESC, mg.created_at DESC
      `
      return result
    } else {
      const result = await sql`
        SELECT 
          mg.id,
          mg.name,
          mg.location,
          mg.category,
          mg.description,
          mg.single_seats,
          mg.single_price,
          mg.double_seats,
          mg.double_price,
          mg.rating,
          mg.amenities,
          mg.contact_phone,
          mg.contact_email,
          mg.address,
          mg.is_active,
          mg.created_at,
          u.name as owner_name,
          u.mobile as owner_mobile,
          u.email as owner_email
        FROM mess_groups mg
        LEFT JOIN users u ON mg.owner_id = u.id
        WHERE mg.is_active = true
        ORDER BY mg.rating DESC, mg.created_at DESC
      `
      return result
    }
  } catch (error) {
    console.error("Error fetching mess groups:", error)
    throw error
  }
}

// Helper function to get a single mess group by ID
export async function getMessGroupById(id: string) {
  try {
    const result = await sql`
      SELECT mg.*, u.name as owner_name, u.email as owner_email, u.mobile as owner_mobile
      FROM mess_groups mg
      LEFT JOIN users u ON mg.owner_id = u.id
      WHERE mg.id = ${id} AND mg.is_active = true
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching mess group by ID:", error)
    throw error
  }
}

// Helper function to create a new mess group
export async function createMessGroup(data: any) {
  try {
    const result = await sql`
      INSERT INTO mess_groups (
        owner_id, name, location, category, description,
        single_seats, single_price, double_seats, double_price,
        amenities, contact_phone, contact_email, address
      ) VALUES (
        ${data.owner_id}, ${data.name}, ${data.location}, ${data.category}, ${data.description},
        ${data.single_seats || 0}, ${data.single_price || 0}, ${data.double_seats || 0}, ${data.double_price || 0},
        ${JSON.stringify(data.amenities || [])}, ${data.contact_phone}, ${data.contact_email}, ${data.address}
      ) RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating mess group:", error)
    throw error
  }
}
