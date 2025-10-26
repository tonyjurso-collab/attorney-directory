'use client';

import { useState } from 'react';

export default function TestPracticeAreas() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testMigration = async () => {
    setLoading(true);
    setStatus('Testing migration status...');
    try {
      const response = await fetch('/api/migrate-practice-areas', {
        method: 'POST',
      });

      const data = await response.json();
      setResults({ success: response.ok, data });
      setStatus(response.ok ? '✓ Migration check complete' : '✗ Migration required');
    } catch (error: any) {
      setResults({ success: false, error: error.message });
      setStatus('✗ Error');
    } finally {
      setLoading(false);
    }
  };

  const testPracticeAreasAPI = async () => {
    setLoading(true);
    setStatus('Testing practice areas API...');
    try {
      const response = await fetch('/api/practice-areas');

      const data = await response.json();
      setResults({ success: response.ok, data });
      setStatus(response.ok ? '✓ Practice areas API working' : '✗ Practice areas API failed');
    } catch (error: any) {
      setResults({ success: false, error: error.message });
      setStatus('✗ Error');
    } finally {
      setLoading(false);
    }
  };

  const testProfileUpdate = async () => {
    setLoading(true);
    setStatus('Testing profile update with practice areas...');
    try {
      // First, get some practice area IDs from the API
      const practiceAreasResponse = await fetch('/api/practice-areas');
      const practiceAreasData = await practiceAreasResponse.json();
      
      if (!practiceAreasData.categories || practiceAreasData.categories.length === 0) {
        throw new Error('No practice areas available for testing');
      }

      // Get the first few practice areas from the first category
      const firstCategory = practiceAreasData.categories[0];
      const practiceAreaIds = firstCategory.practice_areas?.slice(0, 2).map((pa: any) => pa.id) || [];
      
      if (practiceAreaIds.length === 0) {
        throw new Error('No practice areas found in categories');
      }

      const response = await fetch('/api/attorney/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'Attorney',
          bio: 'Testing practice areas functionality',
          practice_areas: practiceAreaIds,
          primary_practice_area: practiceAreaIds[0],
        }),
      });

      const data = await response.json();
      setResults({ success: response.ok, data });
      setStatus(response.ok ? '✓ Profile update working' : '✗ Profile update failed');
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
          Practice Areas Test Page
        </h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Functions</h2>
          <div className="space-y-3">
            <button
              onClick={testMigration}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Test Migration Status
            </button>

            <button
              onClick={testPracticeAreasAPI}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Practice Areas API
            </button>

            <button
              onClick={testProfileUpdate}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Test Profile Update with Practice Areas
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
          <h3 className="font-semibold text-yellow-800 mb-2">Migration Instructions:</h3>
          <div className="text-yellow-700 space-y-2">
            <p><strong>Step 1:</strong> Go to your Supabase dashboard</p>
            <p><strong>Step 2:</strong> Navigate to SQL Editor</p>
            <p><strong>Step 3:</strong> Copy and run the SQL from <code>lib/database/practice-areas-clean-migration.sql</code></p>
            <p><strong>Step 4:</strong> Test the functionality using the buttons above</p>
            <p className="mt-4 text-sm"><strong>Note:</strong> The clean migration script will drop and recreate all practice area tables to ensure a fresh start.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
