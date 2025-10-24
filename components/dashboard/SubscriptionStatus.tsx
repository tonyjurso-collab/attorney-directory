'use client';

import { useState } from 'react';
import { CreditCard, Crown, Star, CheckCircle, XCircle } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';
import { membershipPlans } from '@/lib/stripe/server';

interface SubscriptionStatusProps {
  attorney: AttorneyWithDetails;
}

export function SubscriptionStatus({ attorney }: SubscriptionStatusProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getSubscriptionStatus = () => {
    switch ((attorney as any).subscription_status) {
      case 'active':
        return {
          text: 'Active',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
        };
      case 'past_due':
        return {
          text: 'Past Due',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: XCircle,
        };
      case 'canceled':
        return {
          text: 'Canceled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: XCircle,
        };
      default:
        return {
          text: 'Inactive',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: XCircle,
        };
    }
  };

  const status = getSubscriptionStatus();
  const StatusIcon = status.icon;
  const currentPlan = membershipPlans[(attorney as any).membership_tier as keyof typeof membershipPlans];

  const handleUpgrade = async (tier: string) => {
    // Check if Stripe is configured
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      alert('Stripe is not configured yet. Please contact support.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: tier === 'standard' 
            ? process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_EXCLUSIVE_PRICE_ID,
          attorneyId: attorney.id,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(({ loadStripe }) => 
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      );
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    // Check if Stripe is configured
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      alert('Stripe is not configured yet. Please contact support.');
      return;
    }

    setIsLoading(true);
    try {
      // Create customer portal session
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attorneyId: attorney.id,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.text}
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Plan */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Plan</h3>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {attorney.membership_tier === 'exclusive' ? (
                <Crown className="h-5 w-5 text-yellow-600 mr-2" />
              ) : attorney.membership_tier === 'standard' ? (
                <Star className="h-5 w-5 text-blue-600 mr-2" />
              ) : (
                <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
              )}
              <div>
                <p className="font-medium text-gray-900">{currentPlan.name}</p>
                <p className="text-sm text-gray-600">
                  ${currentPlan.price / 100}/month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Plan Features</h3>
          <ul className="space-y-1">
            {currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Subscription End Date */}
        {(attorney as any).subscription_end_date && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Next Billing Date</h3>
            <p className="text-sm text-gray-600">
              {new Date((attorney as any).subscription_end_date).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Stripe Configuration Notice */}
        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Stripe payment processing is not configured yet. 
              Subscription features will be available once payment credentials are set up.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {attorney.membership_tier === 'free' && (
            <>
              <button
                onClick={() => handleUpgrade('standard')}
                disabled={isLoading || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Upgrade to Standard ($49/month)'}
              </button>
              
              <button
                onClick={() => handleUpgrade('exclusive')}
                disabled={isLoading || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Upgrade to Exclusive ($149/month)'}
              </button>
            </>
          )}

          {attorney.membership_tier === 'standard' && (
            <button
              onClick={() => handleUpgrade('exclusive')}
              disabled={isLoading || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Upgrade to Exclusive ($149/month)'}
            </button>
          )}

          {(attorney.membership_tier === 'standard' || attorney.membership_tier === 'exclusive') && (
            <button
              onClick={handleManageSubscription}
              disabled={isLoading || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
