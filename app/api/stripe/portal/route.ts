import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const { attorneyId } = await request.json();

    if (!attorneyId) {
      return NextResponse.json(
        { error: 'Missing attorney ID' },
        { status: 400 }
      );
    }

    // Verify attorney exists and get customer ID
    const supabase = await createClient();
    const { data: attorney, error: attorneyError } = await supabase
      .from('attorneys')
      .select('stripe_customer_id')
      .eq('id', attorneyId)
      .single();

    if (attorneyError || !attorney || !attorney.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Attorney or customer not found' },
        { status: 404 }
      );
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: attorney.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
