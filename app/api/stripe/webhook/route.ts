import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const attorneyId = session.metadata?.attorney_id;
  
  if (!attorneyId) {
    console.error('No attorney_id in session metadata');
    return;
  }

  // Update attorney with subscription info
  await supabase
    .from('attorneys')
    .update({
      stripe_subscription_id: session.subscription as string,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
    })
    .eq('id', attorneyId);
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string;
  
  // Find attorney by customer ID
  const { data: attorney } = await supabase
    .from('attorneys')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (attorney) {
    // Determine membership tier based on price
    const priceId = subscription.items.data[0].price.id;
    let membershipTier = 'free';
    
    if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) {
      membershipTier = 'standard';
    } else if (priceId === process.env.STRIPE_EXCLUSIVE_PRICE_ID) {
      membershipTier = 'exclusive';
    }

    await supabase
      .from('attorneys')
      .update({
        membership_tier: membershipTier,
        subscription_status: subscription.status,
        subscription_start_date: new Date(subscription.created * 1000).toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', attorney.id);
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string;
  
  const { data: attorney } = await supabase
    .from('attorneys')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (attorney) {
    // Determine membership tier based on price
    const priceId = subscription.items.data[0].price.id;
    let membershipTier = 'free';
    
    if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) {
      membershipTier = 'standard';
    } else if (priceId === process.env.STRIPE_EXCLUSIVE_PRICE_ID) {
      membershipTier = 'exclusive';
    }

    await supabase
      .from('attorneys')
      .update({
        membership_tier: membershipTier,
        subscription_status: subscription.status,
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', attorney.id);
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string;
  
  const { data: attorney } = await supabase
    .from('attorneys')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (attorney) {
    await supabase
      .from('attorneys')
      .update({
        membership_tier: 'free',
        subscription_status: 'canceled',
        subscription_end_date: new Date().toISOString(),
      })
      .eq('id', attorney.id);
  }
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string;
  
  const { data: attorney } = await supabase
    .from('attorneys')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (attorney) {
    await supabase
      .from('attorneys')
      .update({
        subscription_status: 'active',
      })
      .eq('id', attorney.id);
  }
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string;
  
  const { data: attorney } = await supabase
    .from('attorneys')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (attorney) {
    await supabase
      .from('attorneys')
      .update({
        subscription_status: 'past_due',
      })
      .eq('id', attorney.id);
  }
}
