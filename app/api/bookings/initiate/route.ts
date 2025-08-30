import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getMessGroupById, createOrder, createTransaction, hasActiveBooking, getAvailableSeats, getUserOrders, getOrderById } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, mess_group_id, room_type } = body;
    
    if (!user_id || !mess_group_id || !['single', 'double'].includes(room_type)) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }


    // Check for existing pending order for this user/mess/room_type
    const userOrders = await getUserOrders(user_id);
    let order = userOrders.find(
      (o: any) => o.mess_group_id === mess_group_id && o.room_type === room_type && o.status === 'pending'
    );

    // Check available seats
    const availableSeats = await getAvailableSeats(mess_group_id);
    if (!availableSeats) {
      return NextResponse.json({ error: 'Mess group not found' }, { status: 404 });
    }

    const isAvailable = room_type === 'single' 
      ? availableSeats.single_available > 0 
      : availableSeats.double_available > 0;

    if (!isAvailable) {
      return NextResponse.json({ 
        error: `No ${room_type} rooms available`,
        availableSeats 
      }, { status: 400 });
    }

    // Fetch mess group details
    const messGroup = await getMessGroupById(mess_group_id);
    if (!messGroup) {
      return NextResponse.json({ error: 'Mess group not found' }, { status: 404 });
    }

    const price = room_type === 'single' ? messGroup.single_price : messGroup.double_price;


    let transaction;
    if (!order) {
      // No pending order, create new order and transaction
      order = await createOrder(user_id, mess_group_id, room_type);
      if (!order) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }
      transaction = await createTransaction(order.id, price);
      if (!transaction) {
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
      }
    } else {
      // Pending order exists, get or create transaction
      const orderDetails = await getOrderById(order.id);
      if (orderDetails && orderDetails.transaction_id) {
        transaction = {
          id: orderDetails.transaction_id,
          amount: orderDetails.amount,
          currency: orderDetails.currency,
          status: orderDetails.transaction_status,
          payment_method: orderDetails.payment_method,
          stripe_payment_intent_id: orderDetails.stripe_payment_intent_id
        };
      } else {
        transaction = await createTransaction(order.id, price);
        if (!transaction) {
          return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
        }
      }
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: `${messGroup.name} - ${room_type.charAt(0).toUpperCase() + room_type.slice(1)} Room`,
              description: `Monthly mess booking at ${messGroup.address}`,
            },
            unit_amount: Math.round(price * 100), // Convert to paisa
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/mess/${mess_group_id}?success=1&order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/mess/${mess_group_id}?canceled=1&order_id=${order.id}`,
      metadata: {
        user_id: user_id.toString(),
        mess_group_id: mess_group_id.toString(),
        room_type,
        order_id: order.id.toString(),
        transaction_id: transaction.id.toString(),
      },
    });

    // Update transaction with Stripe session ID
    await stripe.checkout.sessions.update(checkoutSession.id, {
      metadata: {
        ...checkoutSession.metadata,
        stripe_session_id: checkoutSession.id,
      }
    });

    return NextResponse.json({ 
      success: true,
      url: checkoutSession.url,
      order_id: order.id,
      transaction_id: transaction.id 
    });

  } catch (error: any) {
    console.error('Booking initiation error:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
