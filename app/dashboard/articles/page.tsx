'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { ArticleWithRelations } from '@/lib/types/articles';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchArticles = useCallback(async () => {
    const supabase = createClient();
    
    try {
      console.log('🔍 Starting fetchArticles...');
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 User:', user, 'Auth error:', authError);

      if (authError || !user) {
        console.log('❌ No user, redirecting to login');
        router.push('/login');
        return;
      }

      // Get attorney_id from user_id
      console.log('🔍 Fetching attorney for user:', user.id);
      const { data: attorney, error: attorneyError } = await supabase
        .from('attorneys')
        .select('id')
        .eq('user_id', user.id)
        .single();

      console.log('👨‍⚖️ Attorney:', attorney, 'Error:', attorneyError);

      if (attorneyError || !attorney) {
        console.log('❌ No attorney found, redirecting to dashboard');
        setError('Attorney profile not found');
        setLoading(false);
        return;
      }

      // Fetch articles for this attorney
      console.log('🔍 Fetching articles for attorney:', attorney.id);
      const { data, error: articlesError } = await supabase
        .from('attorney_articles')
        .select(`
          *,
          attorney:attorneys!inner(
            id,
            first_name,
            last_name,
            firm_name,
            profile_image_url
          )
        )
        `)
        .eq('attorney_id', attorney.id)
        .order('created_at', { ascending: false });

      console.log('📝 Articles response:', { data, error: articlesError });

      if (articlesError) {
        console.error('❌ Articles error:', articlesError);
        throw articlesError;
      }

      // Type guard: ensure data is an array before setting
      // Cast to unknown first to avoid type inference issues
      const articlesData = data as unknown;
      
      if (!articlesData || !Array.isArray(articlesData)) {
        console.log('✅ Articles fetched: 0 (no data or not an array)');
        setArticles([]);
        return;
      }

      console.log('✅ Articles fetched:', articlesData.length);
      
      // Now TypeScript knows articlesData is an array, cast to correct type
      setArticles(articlesData as ArticleWithRelations[]);
    } catch (err: any) {
      console.error('❌ Error fetching articles:', err);
      setError(err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);


  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      published: 'Published',
      rejected: 'Rejected',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleSubmitForApproval = async (articleId: string) => {
    if (!confirm('Submit this article for admin approval?')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_review' }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to submit article');
        return;
      }

      // Refresh articles list
      fetchArticles();
    } catch (error) {
      console.error('Error submitting for approval:', error);
      alert('Failed to submit article');
    }
  };

  const handleDelete = async (articleId: string, status: string) => {
    if (status !== 'draft') {
      alert('Can only delete draft articles');
      return;
    }

    if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete article');
        return;
      }

      // Refresh articles list
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Articles</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Articles</h1>
            <p className="text-gray-600 mt-2">Manage your attorney articles</p>
          </div>
          <Link
            href="/dashboard/articles/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Create Article
          </Link>
        </div>

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No articles yet</h3>
            <p className="mt-2 text-gray-500">Get started by creating your first article.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/articles/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Article
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {article.title}
                      </h3>
                      {getStatusBadge(article.status)}
                    </div>
                    {article.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Created {new Date(article.created_at).toLocaleDateString()}
                      </span>
                      {article.published_at && (
                        <span>
                          Published {new Date(article.published_at).toLocaleDateString()}
                        </span>
                      )}
                      <span>{article.view_count} views</span>
                      {article.rejection_reason && (
                        <span className="text-red-600">
                          Rejected: {article.rejection_reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {article.status === 'draft' && (
                      <button
                        onClick={() => handleSubmitForApproval(article.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Submit for Approval
                      </button>
                    )}
                    {article.status === 'rejected' && (
                      <button
                        onClick={() => handleSubmitForApproval(article.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Resubmit
                      </button>
                    )}
                    <Link
                      href={`/dashboard/articles/${article.id}/edit`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    {article.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(article.id, article.status)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
