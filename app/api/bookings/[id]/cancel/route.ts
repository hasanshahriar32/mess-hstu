import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, updateTransactionStatus, updateMessSeats, getOrderById } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const { action } = await req.json();

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    if (action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get order details first
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json({ 
        error: 'Order cannot be cancelled in current status' 
      }, { status: 400 });
    }

    // Update order status to cancelled
    await updateOrderStatus(orderId, 'cancelled');

    // Update transaction status to cancelled if exists
    if (order.transaction_id) {
      await updateTransactionStatus(order.transaction_id, 'cancelled');
    }

    // If order was confirmed, increment available seats back
    if (order.status === 'confirmed') {
      await updateMessSeats(order.mess_group_id, order.room_type, true);
    }

    const updatedOrder = await getOrderById(orderId);

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedOrder
    });

  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
