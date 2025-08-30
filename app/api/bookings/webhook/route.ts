import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStatus, updateTransactionStatus, updateMessSeats, getOrderById } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      
      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        await handleExpiredPayment(expiredSession);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handleFailedPayment(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const { order_id, transaction_id, mess_group_id, room_type } = session.metadata!;

    if (!order_id || !transaction_id) {
      throw new Error('Missing order_id or transaction_id in session metadata');
    }

    // Update order status to confirmed
    await updateOrderStatus(parseInt(order_id), 'confirmed');

    // Update transaction status to completed
    await updateTransactionStatus(
      parseInt(transaction_id), 
      'completed', 
      'stripe_card'
    );

    // Decrease available seats for the mess
    await updateMessSeats(parseInt(mess_group_id), room_type, false);

    console.log(`Booking confirmed for order ${order_id}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function handleExpiredPayment(session: Stripe.Checkout.Session) {
  try {
    const { order_id, transaction_id } = session.metadata!;

    if (!order_id || !transaction_id) {
      throw new Error('Missing order_id or transaction_id in session metadata');
    }

    // Update order status to expired
    await updateOrderStatus(parseInt(order_id), 'expired');

    // Update transaction status to expired
    await updateTransactionStatus(parseInt(transaction_id), 'expired');

    console.log(`Booking expired for order ${order_id}`);
  } catch (error) {
    console.error('Error handling expired payment:', error);
    throw error;
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    // You might want to implement this based on your needs
    console.log(`Payment failed for payment intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}
