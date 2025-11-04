'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArticleEditor } from '@/components/articles/ArticleEditor';
import Link from 'next/link';
import type { PracticeArea, ArticleWithRelations } from '@/lib/types/articles';

export default function EditArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<ArticleWithRelations | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [practiceAreaIds, setPracticeAreaIds] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchArticle();
    fetchPracticeAreas();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch article');
      }

      const article = data.article;
      setArticle(article);
      setTitle(article.title);
      setContent(article.content);
      setExcerpt(article.excerpt || '');
      setMetaDescription(article.meta_description || '');
      
      // Extract practice area IDs
      if (article.practice_areas) {
        setPracticeAreaIds(article.practice_areas.map((pa: any) => pa.id));
      }
      
      // Extract tags
      if (article.tags) {
        setTags(article.tags.map((tag: any) => tag.name).join(', '));
      }
    } catch (err: any) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchPracticeAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_areas')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPracticeAreas(data || []);
    } catch (err: any) {
      console.error('Error fetching practice areas:', err);
    }
  };

  const handleGenerateMetadata = async () => {
    if (!title || !content) {
      alert('Please enter title and content first');
      return;
    }

    setGeneratingMetadata(true);
    setError(null);

    try {
      const response = await fetch('/api/articles/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate metadata');
      }

      setExcerpt(data.excerpt || '');
      setMetaDescription(data.meta_description || '');
    } catch (err: any) {
      console.error('Error generating metadata:', err);
      setError(err.message);
    } finally {
      setGeneratingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (article?.status === 'published') {
      alert('This article has been published. Your changes will need admin approval before going live.');
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || undefined,
          meta_description: metaDescription || undefined,
          practice_area_ids: practiceAreaIds,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update article');
      }

      // Redirect to articles list
      router.push('/dashboard/articles');
    } catch (err: any) {
      console.error('Error updating article:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link
            href="/dashboard/articles"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/articles"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Articles
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-2">
            Status: <span className="font-medium capitalize">{article.status}</span>
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter article title"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <ArticleEditor
              content={content}
              onChange={setContent}
              autoSaveKey={`article-edit-${articleId}`}
            />
          </div>

          {/* Metadata Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">SEO Metadata</h2>
              <button
                type="button"
                onClick={handleGenerateMetadata}
                disabled={generatingMetadata || !title || !content}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingMetadata ? 'Generating...' : '🤖 AI Generate'}
              </button>
            </div>

            {/* Excerpt */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
                <span className="text-gray-500 ml-2">({excerpt.length} / 200 characters)</span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Brief summary of the article"
                maxLength={200}
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
                <span className="text-gray-500 ml-2">({metaDescription.length} / 160 characters)</span>
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="SEO meta description"
                maxLength={160}
              />
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Practice Areas
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              {practiceAreas.map((pa) => (
                <label key={pa.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={practiceAreaIds.includes(pa.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPracticeAreaIds([...practiceAreaIds, pa.id]);
                      } else {
                        setPracticeAreaIds(practiceAreaIds.filter(id => id !== pa.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{pa.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="legal advice, expert insights, etc."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/dashboard/articles"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}



