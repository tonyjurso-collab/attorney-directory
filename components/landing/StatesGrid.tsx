'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { US_STATES } from '@/lib/utils/states';
import { staggerContainer, staggerItem, hoverLift } from '@/lib/animations/variants';

export function StatesGrid() {
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {US_STATES.map((state) => (
        <motion.div key={state.code} variants={staggerItem}>
          <Link
            href={`/d/${state.slug}`}
            className="group relative bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 block text-center"
          >
            <motion.div 
              className="flex flex-col items-center"
              whileHover={hoverLift}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-blue-50 rounded-full p-3 mb-3 group-hover:scale-110 transition-transform duration-200">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              
              <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                {state.name}
              </h3>
              
              <p className="text-xs text-gray-500 font-medium">
                {state.code}
              </p>
            </motion.div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

