import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSeats } from '@/lib/db';

export async function GET(req: NextRequest, context: any) {
  try {
    const { params } = context;
    const messGroupId = parseInt(params.id);

    if (isNaN(messGroupId)) {
      return NextResponse.json({ error: 'Invalid mess group ID' }, { status: 400 });
    }

    const availableSeats = await getAvailableSeats(messGroupId);

    if (!availableSeats) {
      return NextResponse.json({ error: 'Mess group not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: availableSeats
    });

  } catch (error: any) {
    console.error('Error fetching available seats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch available seats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
