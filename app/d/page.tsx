import { Metadata } from 'next';
import { DirectoryHero } from '@/components/landing/DirectoryHero';
import { StatesGrid } from '@/components/landing/StatesGrid';
import { StatsSection } from '@/components/home/StatsSection';
import { CtaSection } from '@/components/home/CtaSection';

export const metadata: Metadata = {
  title: 'Find Attorneys by State | LegalHub',
  description: 'Browse our nationwide directory of qualified attorneys. Find legal help in your state from experienced professionals across all practice areas.',
  keywords: 'attorney directory, find lawyers by state, legal directory, attorneys near me, lawyer search by state',
};

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <DirectoryHero 
        title="Find Attorneys in Your State"
        description="Browse our nationwide directory of qualified attorneys across all 50 states and Washington D.C. Get connected with legal professionals in your area."
      />

      {/* Stats Section */}
      <StatsSection />

      {/* States Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Select Your State
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find qualified attorneys in your state
            </p>
          </div>
          
          <StatesGrid />
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}

