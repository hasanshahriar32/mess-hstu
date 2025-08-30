import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStatus, updateTransactionStatus, getOrderById } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get order and transaction
    const order = await getOrderById(parseInt(id));
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (!order.transaction_id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Optionally, verify payment with Stripe (if you store payment_intent or session id)
    // For now, just mark as confirmed/completed
    await updateOrderStatus(order.id, 'confirmed');
    await updateTransactionStatus(order.transaction_id, 'completed', 'stripe_card');

    return NextResponse.json({ success: true, message: 'Booking confirmed after payment.' });
  } catch (error: any) {
    console.error('Error confirming booking:', error);
    return NextResponse.json({ error: 'Failed to confirm booking', details: error.message }, { status: 500 });
  }
}
