'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { fadeIn, slideUp } from '@/lib/animations/variants';
import { Star, Zap, Crown, Check } from 'lucide-react';

const planDetails = {
  basic: {
    name: 'Basic Plan',
    price: '$29/month',
    icon: Star,
    color: 'blue',
    features: ['Profile listing', 'Basic contact info', 'Up to 2 practice areas', 'Email support']
  },
  premium: {
    name: 'Premium Plan',
    price: '$79/month',
    icon: Zap,
    color: 'purple',
    features: ['Everything in Basic', 'Featured placement', 'Up to 5 practice areas', 'Priority support']
  },
  exclusive: {
    name: 'Exclusive Plan',
    price: '$149/month',
    icon: Crown,
    color: 'gold',
    features: ['Everything in Premium', 'Top search placement', 'Unlimited practice areas', 'Dedicated manager']
  }
};

function RegisterContent() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan && planDetails[plan as keyof typeof planDetails]) {
      setSelectedPlan(plan);
      setPlanInfo(planDetails[plan as keyof typeof planDetails]);
    }
  }, [searchParams]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          icon: 'text-blue-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-600',
          icon: 'text-purple-600'
        };
      case 'gold':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600',
          icon: 'text-gray-600'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            LegalHub
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join our platform as a legal professional
          </p>
        </motion.div>
      </motion.div>

      {/* Selected Plan Display */}
      {planInfo && (
        <motion.div
          className="mt-6 sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={`rounded-lg border-2 p-4 ${getColorClasses(planInfo.color).border} ${getColorClasses(planInfo.color).bg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`p-2 rounded-full bg-white mr-3`}>
                  <planInfo.icon className={`w-5 h-5 ${getColorClasses(planInfo.color).icon}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${getColorClasses(planInfo.color).text}`}>
                    {planInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600">{planInfo.price}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Selected Plan</span>
              </div>
            </div>
            <div className="space-y-1">
              {planInfo.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <RegisterForm selectedPlan={selectedPlan} />
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
