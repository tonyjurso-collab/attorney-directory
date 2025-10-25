import { Suspense } from 'react';
import { PracticeAreasGrid } from '@/components/home/PracticeAreasGrid';
import { FeaturedAttorneys } from '@/components/home/FeaturedAttorneys';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { CtaSection } from '@/components/home/CtaSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Integrated Search */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Practice Areas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Popular Practice Areas
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find attorneys specializing in your specific legal needs
            </p>
          </div>
          
          <PracticeAreasGrid />
        </div>
      </section>

      {/* Featured Attorneys */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Featured Attorneys
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Top-rated legal professionals in your area
            </p>
          </div>
          
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>}>
            <FeaturedAttorneys />
          </Suspense>
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}
