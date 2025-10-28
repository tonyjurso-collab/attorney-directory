'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { SimpleAlgoliaSearch } from '@/components/search/SimpleAlgoliaSearch';
import { fadeIn, slideUp } from '@/lib/animations/variants';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    radius?: string;
  }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Attorney Search Results
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SearchQueryDisplay searchParams={searchParams} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          }>
            <SearchResultsWrapper searchParams={searchParams} />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

function SearchQueryDisplay({ searchParams }: { searchParams: Promise<{ q?: string; location?: string; radius?: string }> }) {
  const [resolvedParams, setResolvedParams] = React.useState<{ q?: string; location?: string; radius?: string }>({});
  
  React.useEffect(() => {
    searchParams.then(setResolvedParams);
  }, [searchParams]);

  if (resolvedParams.q) {
    return (
      <p className="mt-2 text-lg text-gray-600">
        Results for "{resolvedParams.q}"
        {resolvedParams.location && ` in ${resolvedParams.location}`}
      </p>
    );
  }
  
  return null;
}

function SearchResultsWrapper({ searchParams }: { searchParams: Promise<{ q?: string; location?: string; radius?: string }> }) {
  const [resolvedParams, setResolvedParams] = React.useState<{ q?: string; location?: string; radius?: string }>({});
  
  React.useEffect(() => {
    searchParams.then(setResolvedParams);
  }, [searchParams]);

  return <SimpleAlgoliaSearch searchParams={resolvedParams} />;
}
