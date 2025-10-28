'use client';

import { motion } from 'framer-motion';
import { PracticeAreasGrid } from '@/components/home/PracticeAreasGrid';
import { FeaturedAttorneys } from '@/components/home/FeaturedAttorneys';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { CtaSection } from '@/components/home/CtaSection';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { fadeIn, slideUp } from '@/lib/animations/variants';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Integrated Search */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Practice Areas */}
      <motion.section 
        className="py-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Popular Practice Areas
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find attorneys specializing in your specific legal needs
            </p>
          </motion.div>
          
          <PracticeAreasGrid />
        </div>
      </motion.section>

      {/* Featured Attorneys */}
      <motion.section 
        className="py-16 bg-gray-50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Featured Attorneys
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Top-rated legal professionals in your area
            </p>
          </motion.div>
          
          <FeaturedAttorneys />
        </div>
      </motion.section>

      {/* CTA Section */}
      <CtaSection />

      {/* Global Floating Chat Widget */}
      <ChatWidget position="floating" />
    </div>
  );
}
