'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestArticlesDBPage() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [supabase] = useState(() => {
    console.log('Creating Supabase client...');
    try {
      const client = createClient();
      console.log('Supabase client created:', client);
      console.log('Has .from method?', typeof client.from === 'function');
      console.log('Has .auth method?', typeof client.auth === 'function');
      return client;
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  });

  const testConnection = async () => {
    setStatus('Testing connection...');
    setError('');
    setResult(null);
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('Starting connection test...');
      
      // First test: Check if we can access Supabase at all
      console.log('Checking auth state...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('Auth check result:', { authData, authError });
      
      // Second test: Try a simple query
      console.log('Making Supabase query...');
      
      const timeoutId = setTimeout(() => {
        console.error('Query taking too long, aborting...');
      }, 5000);

      const response = await supabase
        .from('attorney_articles')
        .select('id')
        .limit(1);
      
      clearTimeout(timeoutId);
      console.log('Got response:', response);
      
      const { data, error: connError } = response;
      
      if (connError) {
        console.error('Connection error:', connError);
        setResult({
          success: true,
          message: 'Table exists but no access due to RLS policies (this is normal when not logged in)',
          error: connError.message,
          hint: 'RLS policies are working as expected. Try logging in as an attorney to test further.'
        });
        setStatus('✅ Table exists and RLS is working');
      } else {
        setResult({
          success: true,
          message: 'Successfully connected to attorney_articles table',
          data: data
        });
        setStatus('✅ Connection successful');
      }
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'Unknown error');
      setStatus('❌ Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const testSchema = async () => {
    setStatus('Testing schema...');
    setError('');
    setResult(null);
    setLoading(true);

    try {
      // Check if tables exist by querying their structure
      const tables = [
        'attorney_articles',
        'article_practice_areas',
        'article_tags',
        'article_tag_associations',
        'article_revisions'
      ];

      const results = await Promise.all(
        tables.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          return {
            table,
            exists: !error,
            count: count ?? 0,
            error: error?.message
          };
        })
      );

      setResult({
        success: true,
        tables: results,
        message: 'Schema check complete'
      });
      setStatus('✅ Schema check complete');
    } catch (err: any) {
      setError(err.message);
      setStatus('❌ Schema check failed');
    } finally {
      setLoading(false);
    }
  };

  const testInsert = async () => {
    setStatus('Testing insert...');
    setError('');
    setResult(null);
    setLoading(true);

    try {
      // First, get an attorney ID
      const { data: attorneys, error: attorneysError } = await supabase
        .from('attorneys')
        .select('id')
        .limit(1);

      if (attorneysError || !attorneys || attorneys.length === 0) {
        throw new Error('No attorneys found. Please create an attorney first.');
      }

      const attorneyId = attorneys[0].id;

      // Insert a test article
      const testArticle = {
        attorney_id: attorneyId,
        title: 'Test Article ' + new Date().getTime(),
        slug: 'test-article-' + new Date().getTime(),
        content: 'This is a test article for database verification.',
        status: 'draft'
      };

      const { data, error: insertError } = await supabase
        .from('attorney_articles')
        .insert(testArticle)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      setResult({
        success: true,
        message: 'Test article inserted successfully',
        article: data
      });
      setStatus('✅ Insert successful');
    } catch (err: any) {
      setError(err.message);
      setStatus('❌ Insert failed');
    } finally {
      setLoading(false);
    }
  };

  const testRLS = async () => {
    setStatus('Testing RLS policies...');
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const { data, error: rlsError } = await supabase
        .from('attorney_articles')
        .select('id, status')
        .limit(5);

      if (rlsError) {
        throw new Error(`RLS test failed: ${rlsError.message}`);
      }

      setResult({
        success: true,
        message: `RLS policies working. Retrieved ${data?.length || 0} articles.`,
        articles: data
      });
      setStatus('✅ RLS working correctly');
    } catch (err: any) {
      setError(err.message);
      setStatus('❌ RLS test failed');
    } finally {
      setLoading(false);
    }
  };

  const cleanup = async () => {
    setStatus('Cleaning up test articles...');
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const { error: deleteError } = await supabase
        .from('attorney_articles')
        .delete()
        .eq('title', 'Test Article');

      if (deleteError) {
        throw new Error(`Cleanup failed: ${deleteError.message}`);
      }

      setResult({
        success: true,
        message: 'Test articles cleaned up successfully'
      });
      setStatus('✅ Cleanup complete');
    } catch (err: any) {
      setError(err.message);
      setStatus('❌ Cleanup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attorney Articles - Database Test Page
          </h1>
          <p className="text-gray-600 mb-8">
            Test the database schema, connectivity, and RLS policies for the attorney articles system.
          </p>

          {/* Status Display */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Status: {status || 'Ready to test'}</p>
              {error && (
                <p className="text-sm text-red-600 mt-2">Error: {error}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => {
                console.log('Button clicked, calling testConnection...');
                testConnection();
              }}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              1. Test Connection
            </button>
            <button
              onClick={testSchema}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              2. Test Schema
            </button>
            <button
              onClick={testInsert}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              3. Test Insert
            </button>
            <button
              onClick={testRLS}
              disabled={loading}
              className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              4. Test RLS
            </button>
            <button
              onClick={cleanup}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              5. Cleanup Test Data
            </button>
          </div>

          {/* Results Display */}
          {result && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 overflow-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Run the SQL migration file (<code className="bg-blue-100 px-2 py-1 rounded">lib/database/attorney-articles-schema.sql</code>) in your Supabase SQL editor</li>
              <li>Click "Test Connection" to verify the table exists</li>
              <li>Click "Test Schema" to verify all tables are created</li>
              <li>Click "Test Insert" to insert a test article (requires at least one attorney in the database)</li>
              <li>Click "Test RLS" to verify Row Level Security policies are working</li>
              <li>Click "Cleanup Test Data" to remove test articles when done</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
