'use client';

import { useState } from 'react';

export default function TestArticlesAPIPage() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [articleId, setArticleId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    meta_description: '',
    practice_area_ids: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent, action: string) => {
    e.preventDefault();
    setStatus(`Testing ${action}...`);
    setError('');
    setResult(null);

    try {
      let response;

      if (action === 'create') {
        response = await fetch('/api/articles/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            practice_area_ids: formData.practice_area_ids ? formData.practice_area_ids.split(',').map((id: string) => id.trim()) : [],
            tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : []
          })
        });
      } else if (action === 'get') {
        if (!articleId) {
          setError('Please enter an article ID');
          return;
        }
        response = await fetch(`/api/articles/${articleId}`);
      } else if (action === 'update') {
        if (!articleId) {
          setError('Please enter an article ID');
          return;
        }
        response = await fetch(`/api/articles/${articleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else if (action === 'delete') {
        if (!articleId) {
          setError('Please enter an article ID');
          return;
        }
        response = await fetch(`/api/articles/${articleId}`, {
          method: 'DELETE'
        });
      } else if (action === 'list') {
        response = await fetch('/api/articles');
      }

      const data = await response?.json();

      if (!response?.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
      setStatus(`✅ ${action} successful`);

      // If creating, save the ID
      if (action === 'create' && data.article) {
        setArticleId(data.article.id);
      }

    } catch (err: any) {
      setError(err.message);
      setStatus(`❌ ${action} failed`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attorney Articles - API Test Page
          </h1>
          <p className="text-gray-600 mb-8">
            Test the API endpoints for creating, reading, updating, and deleting articles.
            <span className="text-sm text-gray-500 ml-2">(Login required)</span>
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
        </div>

        {/* Create Article Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create Article</h2>
          
          <form onSubmit={(e) => handleSubmit(e, 'create')} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Article title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={6}
                placeholder="Article content"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Brief excerpt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="SEO meta description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Practice Area IDs (comma-separated)
              </label>
              <input
                type="text"
                value={formData.practice_area_ids}
                onChange={(e) => setFormData({ ...formData, practice_area_ids: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="uuid1, uuid2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="family law, litigation"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Article
            </button>
          </form>
        </div>

        {/* Other Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Article</h2>
            <form onSubmit={(e) => handleSubmit(e, 'get')} className="space-y-4">
              <input
                type="text"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Article ID or slug"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium w-full"
              >
                Get Article
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">List Articles</h2>
            <form onSubmit={(e) => handleSubmit(e, 'list')} className="space-y-4">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium w-full"
              >
                List All Articles
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Article</h2>
            <form onSubmit={(e) => handleSubmit(e, 'update')} className="space-y-4">
              <input
                type="text"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Article ID"
              />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Updated title"
              />
              <button
                type="submit"
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium w-full"
              >
                Update Article
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Article</h2>
            <form onSubmit={(e) => handleSubmit(e, 'delete')} className="space-y-4">
              <input
                type="text"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Article ID"
              />
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium w-full"
              >
                Delete Article
              </button>
            </form>
          </div>
        </div>

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 overflow-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



