'use client';

import { useState } from 'react';

export default function SyncAlgoliaPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const syncData = async () => {
    setIsSyncing(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔄 Starting sync process...');

      // Use the server-side API route to perform the indexing
      const response = await fetch('/api/index-algolia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Indexing failed: ${errorData.details || errorData.error}`);
      }

      const data = await response.json();
      console.log('✅ Algolia indexing result:', data);

      setResults({
        message: data.message,
        summary: data.summary,
        algoliaResult: data.algoliaResult,
        attorneys: data.summary ? [
          { total: data.summary.total },
          { withGeo: data.summary.withGeo },
          { withoutGeo: data.summary.withoutGeo },
          { withPracticeAreas: data.summary.withPracticeAreas }
        ] : []
      });

    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Sync Supabase to Algolia
          </h1>
          
          <div className="mb-6">
            <button
              onClick={syncData}
              disabled={isSyncing}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? 'Syncing...' : 'Start Sync'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {results && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <strong>Success:</strong> {results.message}
              <div className="mt-2 text-sm">
                <p>Total attorneys: {results.summary.total}</p>
                <p>With geo data: {results.summary.withGeo}</p>
                <p>Without geo data: {results.summary.withoutGeo}</p>
                <p>With practice areas: {results.summary.withPracticeAreas}</p>
              </div>
            </div>
          )}

          {results && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attorney Summary</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.attorneys.map((attorney: any) => (
                  <div key={attorney.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{attorney.name}</span>
                      <span className="text-gray-600 ml-2">
                        {attorney.city}, {attorney.state}
                      </span>
                      <span className="text-blue-600 text-sm ml-2">
                        ({attorney.practiceAreas} practice areas)
                      </span>
                    </div>
                    <div className="flex items-center">
                      {attorney.hasGeo ? (
                        <span className="text-green-600 text-sm">📍 Has Geo</span>
                      ) : (
                        <span className="text-red-600 text-sm">❌ No Geo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}