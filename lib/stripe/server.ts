import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const membershipPlans = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic profile listing',
      'Contact form',
      'Low search ranking',
    ],
  },
  standard: {
    name: 'Standard',
    price: 4900, // $49.00 in cents
    stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID!,
    features: [
      'Enhanced profile listing',
      'Direct lead delivery',
      'Mid-tier search ranking',
      'Featured placement',
    ],
  },
  exclusive: {
    name: 'Exclusive',
    price: 14900, // $149.00 in cents
    stripePriceId: process.env.STRIPE_EXCLUSIVE_PRICE_ID!,
    features: [
      'Premium profile listing',
      'Direct lead delivery',
      'Top search ranking',
      'Featured placement',
      'Profile video',
      'Priority support',
    ],
  },
} as const;
