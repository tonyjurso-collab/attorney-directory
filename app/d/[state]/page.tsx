import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DirectoryHero } from '@/components/landing/DirectoryHero';
import { StatePracticeAreasGrid } from '@/components/landing/StatePracticeAreasGrid';
import { StatsSection } from '@/components/home/StatsSection';
import { CtaSection } from '@/components/home/CtaSection';
import { getStateName, isValidState, US_STATES } from '@/lib/utils/states';

interface StatePageProps {
  params: Promise<{
    state: string;
  }>;
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state } = await params;
  
  if (!isValidState(state)) {
    return {
      title: 'State Not Found | LegalHub',
    };
  }
  
  const stateName = getStateName(state);
  
  return {
    title: `Find a ${stateName} Attorney | LegalHub`,
    description: `Find qualified attorneys in ${stateName}. Browse our directory of experienced legal professionals across all practice areas serving clients in ${stateName}.`,
    keywords: `${stateName} attorney, ${stateName} lawyer, find attorney in ${stateName}, legal services ${stateName}, attorneys ${stateName}`,
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params;
  
  // Validate state
  if (!isValidState(state)) {
    notFound();
  }
  
  const stateName = getStateName(state);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <DirectoryHero 
        title={`Find a ${stateName} Attorney`}
        description={`Connect with qualified legal professionals across all practice areas in ${stateName}. Get matched with experienced attorneys who can help with your specific legal needs.`}
        state={stateName}
      />

      {/* Stats Section */}
      <StatsSection />

      {/* Practice Areas Grid with Subcategories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Practice Areas in {stateName}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Browse legal services by practice area and find the right attorney for your case
            </p>
          </div>
          
          <StatePracticeAreasGrid state={state} />
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}

// Generate static params for all states
export async function generateStaticParams() {
  return US_STATES.map((state) => ({
    state: state.slug,
  }));
}

