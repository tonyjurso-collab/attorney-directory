'use client';

import { useState } from 'react';

export default function TestAlgoliaUpdate() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testMethod1 = async () => {
    setLoading(true);
    setStatus('Testing Method 1: Using lib/algolia/server.ts...');
    try {
      const response = await fetch('/api/attorney/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: 'anthony',
          last_name: 'urso',
          firm_name: 'dewey',
          bio: 'Test bio updated at ' + new Date().toISOString(),
          phone: '(704) 555-1212',
          email: 'safdasdfwea@fsadfas.net',
          website: 'rtyertyerty',
          address_line1: '123 main street',
          address_line2: '',
          city: 'dallas',
          state: 'NC',
          zip_code: '28034',
          experience_years: 4,
        }),
      });

      const data = await response.json();
      setResults({ success: response.ok, data });
      setStatus(response.ok ? '✓ Success' : '✗ Failed');
    } catch (error: any) {
      setResults({ success: false, error: error.message });
      setStatus('✗ Error');
    } finally {
      setLoading(false);
    }
  };

  const testMethod2 = async () => {
    setLoading(true);
    setStatus('Testing Method 2: Direct API call with initIndex...');
    try {
      const response = await fetch('/api/test-algolia-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attorneyId: '844baebd-2efb-4f1b-99c7-4de6abfaacb4',
          bio: 'Test bio v2 at ' + new Date().toISOString(),
        }),
      });

      const data = await response.json();
      setResults({ success: response.ok, data });
      setStatus(response.ok ? '✓ Success' : '✗ Failed');
    } catch (error: any) {
      setResults({ success: false, error: error.message });
      setStatus('✗ Error');
    } finally {
      setLoading(false);
    }
  };

  const testMethod3 = async () => {
    setLoading(true);
    setStatus('Testing Method 3: Using simple-index route pattern...');
    try {
      const response = await fetch('/api/test-algolia-update-simple', {
        method: 'POST',
      });

      const data = await response.json();
      setResults({ success: response.ok, data });
      setStatus(response.ok ? '✓ Success' : '✗ Failed');
    } catch (error: any) {
      setResults({ success: false, error: error.message });
      setStatus('✗ Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Algolia Update Test Page
        </h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Methods</h2>
          <div className="space-y-3">
            <button
              onClick={testMethod1}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Method 1: Via Profile API (current approach)
            </button>

            <button
              onClick={testMethod2}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Method 2: Direct with initIndex
            </button>

            <button
              onClick={testMethod3}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Method 3: Simple pattern from working routes
            </button>
          </div>
        </div>

        {status && (
          <div className={`bg-${status.includes('✓') ? 'green' : 'red'}-50 border border-${status.includes('✓') ? 'green' : 'red'}-200 rounded-lg p-4 mb-6`}>
            <p className={`text-${status.includes('✓') ? 'green' : 'red'}-800 font-medium`}>
              {status}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {results && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Results</h3>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Testing Attorney:</h3>
          <p className="text-yellow-700">
            <strong>Name:</strong> Anthony Urso<br />
            <strong>ID:</strong> 844baebd-2efb-4f1b-99c7-4de6abfaacb4
          </p>
        </div>
      </div>
    </div>
  );
}
