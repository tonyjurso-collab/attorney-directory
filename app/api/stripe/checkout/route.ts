import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, membershipPlans } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  try {
    const { priceId, attorneyId } = await request.json();

    if (!priceId || !attorneyId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify attorney exists and get user info
    const supabase = await createClient();
    const { data: attorney, error: attorneyError } = await supabase
      .from('attorneys')
      .select('user_id, stripe_customer_id, email')
      .eq('id', attorneyId)
      .single();

    if (attorneyError || !attorney) {
      return NextResponse.json(
        { error: 'Attorney not found' },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let customerId = attorney.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: attorney.email,
        metadata: {
          attorney_id: attorneyId,
        },
      });
      
      customerId = customer.id;
      
      // Update attorney record with customer ID
      await supabase
        .from('attorneys')
        .update({ stripe_customer_id: customerId })
        .eq('id', attorneyId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
      metadata: {
        attorney_id: attorneyId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
