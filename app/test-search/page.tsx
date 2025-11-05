'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { liteClient } from 'algoliasearch/lite';

interface TestResult {
  scenario: string;
  method: 'supabase' | 'algolia';
  success: boolean;
  results: any[];
  error?: string;
  duration: number;
}

export default function TestSearchPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Direct Supabase query for Sarah
    console.log('🧪 Test 1: Direct Supabase query for Sarah');
    const start1 = Date.now();
    try {
      const supabase = createClient();
      const { data: attorneys, error } = await supabase
        .from('attorneys')
        .select('*')
        .ilike('first_name', '%sarah%');
      
      testResults.push({
        scenario: 'Direct Supabase - Sarah by first_name',
        method: 'supabase',
        success: !error,
        results: attorneys || [],
        error: error?.message,
        duration: Date.now() - start1
      });
    } catch (error: any) {
      testResults.push({
        scenario: 'Direct Supabase - Sarah by first_name',
        method: 'supabase',
        success: false,
        results: [],
        error: error.message,
        duration: Date.now() - start1
      });
    }

    // Test 2: Supabase query with full name
    console.log('🧪 Test 2: Supabase query with full name');
    const start2 = Date.now();
    try {
      const supabase = createClient();
      const { data: attorneys, error } = await supabase
        .from('attorneys')
        .select('*')
        .or('first_name.ilike.%sarah%,last_name.ilike.%sarah%');
      
      testResults.push({
        scenario: 'Direct Supabase - Sarah by first_name OR last_name',
        method: 'supabase',
        success: !error,
        results: attorneys || [],
        error: error?.message,
        duration: Date.now() - start2
      });
    } catch (error: any) {
      testResults.push({
        scenario: 'Direct Supabase - Sarah by first_name OR last_name',
        method: 'supabase',
        success: false,
        results: [],
        error: error.message,
        duration: Date.now() - start2
      });
    }

    // Test 3: Supabase API route
    console.log('🧪 Test 3: Supabase API route');
    const start3 = Date.now();
    try {
      const response = await fetch('/api/search/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'sarah' })
      });
      
      const data = await response.json();
      testResults.push({
        scenario: 'Supabase API route - sarah',
        method: 'supabase',
        success: response.ok,
        results: data.results || [],
        error: data.error,
        duration: Date.now() - start3
      });
    } catch (error: any) {
      testResults.push({
        scenario: 'Supabase API route - sarah',
        method: 'supabase',
        success: false,
        results: [],
        error: error.message,
        duration: Date.now() - start3
      });
    }

    // Test 4: Algolia liteClient - basic search
    console.log('🧪 Test 4: Algolia liteClient - basic search');
    const start4 = Date.now();
    try {
      const client = liteClient(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
      );
      
      const searchResponse = await client.search({
        requests: [{
          indexName: 'attorneys',
          query: 'sarah',
          hitsPerPage: 20
        }]
      });
      
      testResults.push({
        scenario: 'Algolia liteClient - basic sarah search',
        method: 'algolia',
        success: true,
        results: (searchResponse.results[0] as any)?.hits || [],
        duration: Date.now() - start4
      });
    } catch (error: any) {
      testResults.push({
        scenario: 'Algolia liteClient - basic sarah search',
        method: 'algolia',
        success: false,
        results: [],
        error: error.message,
        duration: Date.now() - start4
      });
    }

    // Test 5: Algolia liteClient - empty query
    console.log('🧪 Test 5: Algolia liteClient - empty query');
    const start5 = Date.now();
    try {
      const client = liteClient(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
      );
      
      const searchResponse = await client.search({
        requests: [{
          indexName: 'attorneys',
          query: '',
          hitsPerPage: 20
        }]
      });
      
      testResults.push({
        scenario: 'Algolia liteClient - empty query (should return all)',
        method: 'algolia',
        success: true,
        results: (searchResponse.results[0] as any)?.hits || [],
        duration: Date.now() - start5
      });
    } catch (error: any) {
      testResults.push({
        scenario: 'Algolia liteClient - empty query (should return all)',
        method: 'algolia',
        success: false,
        results: [],
        error: error.message,
        duration: Date.now() - start5
      });
    }

    // Test 6: Check what's actually in Supabase
    console.log('🧪 Test 6: Check what\'s actually in Supabase');
    const start6 = Date.now();
    try {
      const supabase = createClient();
      const { data: allAttorneys, error } = await supabase
        .from('attorneys')
        .select('id, first_name, last_name, city, state, is_active')
        .eq('is_active', true);
      
      testResults.push({
        scenario: 'All active attorneys in Supabase',
        method: 'supabase',
        success: !error,
        results: allAttorneys || [],
        error: error?.message,
        duration: Date.now() - start6
      });
    } catch (error: any) {
      testResults.push({
        scenario: 'All active attorneys in Supabase',
        method: 'supabase',
        success: false,
        results: [],
        error: error.message,
        duration: Date.now() - start6
      });
    }

    // Test 7: Check if Sarah exists with exact match
    console.log('🧪 Test 7: Check if Sarah exists with exact match');
    const start7 = Date.now();
    try {
      const supabase = createClient();
      const { data: sarahExact, error } = await supabase
        .from('attorneys')
        .select('*')
        .eq('first_name', 'Sarah');
      
      testResults.push({
        scenario: 'Exact match for first_name = "Sarah"',
        method: 'supabase',
        success: !error,
        results: sarahExact || [],
        error: error?.message,
        duration: Date.now() - start7
      });
    } catch (error: any) {
      testResults.push({
        scenario: 'Exact match for first_name = "Sarah"',
        method: 'supabase',
        success: false,
        results: [],
        error: error.message,
        duration: Date.now() - start7
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Test Suite</h1>
          
          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{result.scenario}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                      <span className="text-xs text-gray-500">{result.duration}ms</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Method:</strong> {result.method} | 
                    <strong> Results:</strong> {result.results.length} | 
                    <strong> Duration:</strong> {result.duration}ms
                  </div>
                  
                  {result.error && (
                    <div className="text-sm text-red-600 mb-2">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.results.length > 0 && (
                    <div className="text-sm">
                      <strong>Results:</strong>
                      <ul className="mt-1 space-y-1">
                        {result.results.slice(0, 3).map((attorney, idx) => (
                          <li key={idx} className="text-gray-700">
                            • {attorney.first_name} {attorney.last_name} 
                            {attorney.firm_name && ` (${attorney.firm_name})`}
                            {attorney.city && attorney.state && ` - ${attorney.city}, ${attorney.state}`}
                          </li>
                        ))}
                        {result.results.length > 3 && (
                          <li className="text-gray-500">... and {result.results.length - 3} more</li>
                        )}
                      </ul>
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
