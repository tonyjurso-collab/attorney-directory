import { Suspense } from 'react';
import { SimpleAlgoliaSearch } from '@/components/search/SimpleAlgoliaSearch';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    radius?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await the searchParams Promise in Next.js 15
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Attorney Search Results
          </h1>
          {resolvedSearchParams.q && (
            <p className="mt-2 text-lg text-gray-600">
              Results for "{resolvedSearchParams.q}"
            </p>
          )}
        </div>

        <SimpleAlgoliaSearch searchParams={resolvedSearchParams} />
      </div>
    </div>
  );
}
