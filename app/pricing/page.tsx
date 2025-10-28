'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations/variants';

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for new attorneys starting their practice',
    price: 29,
    period: 'month',
    icon: Star,
    color: 'blue',
    features: [
      'Profile listing in directory',
      'Basic contact information',
      'Up to 2 practice areas',
      'Email support',
      'Basic analytics',
      'Mobile responsive profile'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ideal for established attorneys looking to grow',
    price: 79,
    period: 'month',
    icon: Zap,
    color: 'purple',
    features: [
      'Everything in Basic',
      'Featured profile placement',
      'Up to 5 practice areas',
      'Priority customer support',
      'Advanced analytics dashboard',
      'Lead generation tools',
      'Social media integration',
      'Custom profile URL'
    ],
    popular: true
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    description: 'For top-tier attorneys who want maximum visibility',
    price: 149,
    period: 'month',
    icon: Crown,
    color: 'gold',
    features: [
      'Everything in Premium',
      'Top placement in search results',
      'Unlimited practice areas',
      'Dedicated account manager',
      'Custom branding options',
      'Advanced lead tracking',
      'Priority in featured sections',
      'White-label solutions',
      'API access'
    ],
    popular: false
  }
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setIsRedirecting(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirect to registration with selected plan
    router.push(`/register?plan=${planId}`);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          icon: 'text-blue-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700',
          icon: 'text-purple-600'
        };
      case 'gold':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700',
          icon: 'text-gray-600'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div
        className="bg-white py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Choose Your Attorney Plan
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join thousands of attorneys who trust our platform to grow their practice. 
              Select the plan that fits your needs and start connecting with clients today.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        className="py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {pricingPlans.map((plan, index) => {
              const colors = getColorClasses(plan.color);
              const IconComponent = plan.icon;
              
              return (
                <motion.div
                  key={plan.id}
                  variants={staggerItem}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'border-purple-300 scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    >
                      <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </motion.div>
                  )}

                  <div className="p-8">
                    {/* Icon and Title */}
                    <motion.div
                      className="text-center mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colors.bg} mb-4`}>
                        <IconComponent className={`w-8 h-8 ${colors.icon}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600">{plan.description}</p>
                    </motion.div>

                    {/* Price */}
                    <motion.div
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                    >
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600 ml-2">/{plan.period}</span>
                      </div>
                    </motion.div>

                    {/* Features */}
                    <motion.div
                      className="mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                    >
                      <ul className="space-y-4">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 1.1 + index * 0.1 + featureIndex * 0.05 }}
                          >
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isRedirecting && selectedPlan === plan.id}
                      className={`w-full py-4 px-6 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center ${
                        plan.popular
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : colors.button
                      } ${
                        isRedirecting && selectedPlan === plan.id
                          ? 'opacity-75 cursor-not-allowed'
                          : 'hover:shadow-lg'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isRedirecting && selectedPlan === plan.id ? (
                        <motion.div
                          className="flex items-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Redirecting...
                        </motion.div>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="bg-white py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about our attorney plans
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              {
                question: "Can I change my plan later?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Is there a free trial?",
                answer: "We offer a 14-day free trial for all plans. No credit card required to get started."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="bg-gray-50 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="bg-blue-600 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.0 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          >
            Ready to Grow Your Practice?
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.4 }}
          >
            Join over 10,000 attorneys who trust our platform to connect with clients
          </motion.p>
          <motion.button
            onClick={() => router.push('/register')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Free Trial
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
