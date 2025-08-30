import { NextRequest, NextResponse } from 'next/server';
import { getUserOrders, getAllBookings } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get user_id from query parameters
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let orders;
    if (user_id === 'all') {
      // Admin: fetch all bookings
      orders = await getAllBookings();
    } else {
      // User: fetch only their bookings
      const parsedId = parseInt(user_id);
      if (isNaN(parsedId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
      orders = await getUserOrders(parsedId);
    }

    return NextResponse.json({
      success: true,
      data: orders
    });

  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch booking history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
