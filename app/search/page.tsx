import { Suspense } from 'react';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SimpleAlgoliaSearch } from '@/components/search/SimpleAlgoliaSearch';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    practice_area?: string;
    location?: string;
    tier?: string;
    radius?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await the searchParams Promise in Next.js 15
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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

        {/* Use Algolia if configured, otherwise fall back to Supabase search */}
        {process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? (
          <SimpleAlgoliaSearch searchParams={resolvedSearchParams} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Refine Search
                </h2>
                <Suspense fallback={<div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>}>
                  <SearchFilters searchParams={resolvedSearchParams} />
                </Suspense>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <Suspense fallback={
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }>
                <SearchResults searchParams={resolvedSearchParams} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
