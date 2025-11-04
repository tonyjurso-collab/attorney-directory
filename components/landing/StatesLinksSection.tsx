'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { US_STATES } from '@/lib/utils/states';
import { staggerContainer, staggerItem } from '@/lib/animations/variants';

interface StatesLinksSectionProps {
  category: string;
}

export function StatesLinksSection({ category }: StatesLinksSectionProps) {
  // Format category slug to readable practice area name
  const getPracticeAreaName = (categorySlug: string): string => {
    return categorySlug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const practiceAreaName = getPracticeAreaName(category);

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Find {practiceAreaName} Attorneys by State
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our network of qualified {practiceAreaName.toLowerCase()} attorneys serving clients across all states.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {US_STATES.map((state, index) => (
            <motion.div key={state.code} variants={staggerItem}>
              <Link
                href={`/d/${state.slug}/${category}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 text-center group"
              >
                <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors duration-200">
                  {state.name}
                </span>
                <span className="block text-sm text-gray-500 mt-1 group-hover:text-blue-500 transition-colors duration-200">
                  {practiceAreaName}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
