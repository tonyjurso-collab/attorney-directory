'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PRACTICE_AREAS, PRACTICE_AREA_SUBCATEGORIES } from '@/lib/utils/practice-areas';
import { staggerContainer, staggerItem, hoverLift } from '@/lib/animations/variants';

interface StatePracticeAreasGridProps {
  state: string;
}

export function StatePracticeAreasGrid({ state }: StatePracticeAreasGridProps) {
  const stateSlug = state.toLowerCase();

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {PRACTICE_AREAS.map((area) => {
        const IconComponent = area.icon;
        const subcategories = PRACTICE_AREA_SUBCATEGORIES[area.id] || [];
        
        return (
          <motion.div key={area.id} variants={staggerItem}>
            <div className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden">
              {/* Main Practice Area Card */}
              <Link
                href={`/d/${stateSlug}/${area.id}`}
                className="block p-6"
              >
                <motion.div 
                  className="flex flex-col"
                  whileHover={hoverLift}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${area.bgColor} rounded-full p-3 mb-4 w-fit group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className={`h-6 w-6 ${area.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {area.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {area.description}
                  </p>
                </motion.div>
              </Link>
              
              {/* Subcategories Section */}
              {subcategories.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Popular Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subcategories.slice(0, 4).map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/d/${stateSlug}/${area.id}/${subcategory.slug}`}
                        className="inline-block px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                    {subcategories.length > 4 && (
                      <span className="inline-block px-3 py-1.5 text-xs font-medium text-gray-500">
                        +{subcategories.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

