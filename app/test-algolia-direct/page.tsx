'use client';

import { useState } from 'react';
import { liteClient } from 'algoliasearch/lite';

interface AlgoliaTestResult {
  test: string;
  success: boolean;
  results: any[];
  error?: string;
  totalHits?: number;
  processingTime?: number;
}

export default function TestAlgoliaDirectPage() {
  const [results, setResults] = useState<AlgoliaTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAlgoliaTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: AlgoliaTestResult[] = [];

    try {
      const client = liteClient(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
      );

      // Test 1: Empty search (should return all records)
      console.log('🧪 Test 1: Empty search');
      try {
        const emptySearch = await client.search({
          requests: [{
            indexName: 'attorneys',
            query: '',
            hitsPerPage: 20
          }]
        });

        testResults.push({
          test: 'Empty search (should return all records)',
          success: true,
          results: emptySearch.results[0]?.hits || [],
          totalHits: emptySearch.results[0]?.nbHits,
          processingTime: emptySearch.results[0]?.processingTimeMS
        });

        console.log('✅ Empty search results:', {
          totalHits: emptySearch.results[0]?.nbHits,
          hits: emptySearch.results[0]?.hits?.length
        });
      } catch (error: any) {
        testResults.push({
          test: 'Empty search (should return all records)',
          success: false,
          results: [],
          error: error.message
        });
      }

      // Test 2: Search for "sarah"
      console.log('🧪 Test 2: Search for "sarah"');
      try {
        const sarahSearch = await client.search({
          requests: [{
            indexName: 'attorneys',
            query: 'sarah',
            hitsPerPage: 20
          }]
        });

        testResults.push({
          test: 'Search for "sarah"',
          success: true,
          results: sarahSearch.results[0]?.hits || [],
          totalHits: sarahSearch.results[0]?.nbHits,
          processingTime: sarahSearch.results[0]?.processingTimeMS
        });

        console.log('✅ Sarah search results:', {
          totalHits: sarahSearch.results[0]?.nbHits,
          hits: sarahSearch.results[0]?.hits?.length
        });
      } catch (error: any) {
        testResults.push({
          test: 'Search for "sarah"',
          success: false,
          results: [],
          error: error.message
        });
      }

      // Test 3: Search for "Sarah"
      console.log('🧪 Test 3: Search for "Sarah"');
      try {
        const SarahSearch = await client.search({
          requests: [{
            indexName: 'attorneys',
            query: 'Sarah',
            hitsPerPage: 20
          }]
        });

        testResults.push({
          test: 'Search for "Sarah" (capitalized)',
          success: true,
          results: SarahSearch.results[0]?.hits || [],
          totalHits: SarahSearch.results[0]?.nbHits,
          processingTime: SarahSearch.results[0]?.processingTimeMS
        });

        console.log('✅ Sarah (capitalized) search results:', {
          totalHits: SarahSearch.results[0]?.nbHits,
          hits: SarahSearch.results[0]?.hits?.length
        });
      } catch (error: any) {
        testResults.push({
          test: 'Search for "Sarah" (capitalized)',
          success: false,
          results: [],
          error: error.message
        });
      }

      // Test 4: Search for "s"
      console.log('🧪 Test 4: Search for "s"');
      try {
        const sSearch = await client.search({
          requests: [{
            indexName: 'attorneys',
            query: 's',
            hitsPerPage: 20
          }]
        });

        testResults.push({
          test: 'Search for "s" (single character)',
          success: true,
          results: sSearch.results[0]?.hits || [],
          totalHits: sSearch.results[0]?.nbHits,
          processingTime: sSearch.results[0]?.processingTimeMS
        });

        console.log('✅ S search results:', {
          totalHits: sSearch.results[0]?.nbHits,
          hits: sSearch.results[0]?.hits?.length
        });
      } catch (error: any) {
        testResults.push({
          test: 'Search for "s" (single character)',
          success: false,
          results: [],
          error: error.message
        });
      }

      // Test 5: Search for "johnson"
      console.log('🧪 Test 5: Search for "johnson"');
      try {
        const johnsonSearch = await client.search({
          requests: [{
            indexName: 'attorneys',
            query: 'johnson',
            hitsPerPage: 20
          }]
        });

        testResults.push({
          test: 'Search for "johnson"',
          success: true,
          results: johnsonSearch.results[0]?.hits || [],
          totalHits: johnsonSearch.results[0]?.nbHits,
          processingTime: johnsonSearch.results[0]?.processingTimeMS
        });

        console.log('✅ Johnson search results:', {
          totalHits: johnsonSearch.results[0]?.nbHits,
          hits: johnsonSearch.results[0]?.hits?.length
        });
      } catch (error: any) {
        testResults.push({
          test: 'Search for "johnson"',
          success: false,
          results: [],
          error: error.message
        });
      }

      // Test 6: Search for "personal"
      console.log('🧪 Test 6: Search for "personal"');
      try {
        const personalSearch = await client.search({
          requests: [{
            indexName: 'attorneys',
            query: 'personal',
            hitsPerPage: 20
          }]
        });

        testResults.push({
          test: 'Search for "personal" (practice area)',
          success: true,
          results: personalSearch.results[0]?.hits || [],
          totalHits: personalSearch.results[0]?.nbHits,
          processingTime: personalSearch.results[0]?.processingTimeMS
        });

        console.log('✅ Personal search results:', {
          totalHits: personalSearch.results[0]?.nbHits,
          hits: personalSearch.results[0]?.hits?.length
        });
      } catch (error: any) {
        testResults.push({
          test: 'Search for "personal" (practice area)',
          success: false,
          results: [],
          error: error.message
        });
      }

    } catch (error: any) {
      console.error('❌ General Algolia test error:', error);
      testResults.push({
        test: 'General Algolia connection',
        success: false,
        results: [],
        error: error.message
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Direct Algolia Search Test</h1>
          
          <div className="mb-6">
            <button
              onClick={runAlgoliaTests}
              disabled={isRunning}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running Tests...' : 'Run Algolia Tests'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Algolia Test Results</h2>
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                      {result.processingTime && (
                        <span className="text-xs text-gray-500">{result.processingTime}ms</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Total Hits:</strong> {result.totalHits || 0} | 
                    <strong> Results:</strong> {result.results.length} | 
                    {result.processingTime && (
                      <>
                        <strong> Processing Time:</strong> {result.processingTime}ms
                      </>
                    )}
                  </div>
                  
                  {result.error && (
                    <div className="text-sm text-red-600 mb-2">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.results.length > 0 && (
                    <div className="text-sm">
                      <strong>Results:</strong>
                      <div className="mt-2 space-y-2">
                        {result.results.map((hit: any, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border text-xs">
                            <div><strong>ObjectID:</strong> {hit.objectID}</div>
                            <div><strong>Name:</strong> {hit.name}</div>
                            <div><strong>City:</strong> {hit.city}</div>
                            <div><strong>State:</strong> {hit.state}</div>
                            <div><strong>Practice Areas:</strong> {hit.practice_areas?.map((pa: any) => pa.name).join(', ') || 'None'}</div>
                            <div><strong>Geo Location:</strong> {hit._geoloc ? `${hit._geoloc.lat}, ${hit._geoloc.lng}` : 'None'}</div>
                            <div><strong>Raw Data:</strong> <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">{JSON.stringify(hit, null, 2)}</pre></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
