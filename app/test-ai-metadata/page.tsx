'use client';

import { useState } from 'react';

const sampleContent = `Personal injury law is a critical area of legal practice that helps individuals who have been harmed due to someone else's negligence or intentional actions. Whether you've been injured in a car accident, slipped and fell on someone's property, or experienced medical malpractice, understanding your rights is essential.

When you're injured, the physical pain and emotional trauma can be overwhelming. On top of that, you may be facing mounting medical bills, lost wages from missed work, and uncertainty about your future. That's where a skilled personal injury attorney comes in. A qualified lawyer can help you navigate the complex legal system, negotiate with insurance companies, and fight for the compensation you deserve.

It's important to take action quickly after an injury. Evidence can disappear, witnesses' memories can fade, and there are strict time limits (statutes of limitations) that determine when you can file a claim. Most states require you to file a personal injury lawsuit within two to three years of the incident. Don't wait until it's too late - consult with an experienced attorney as soon as possible.`;

export default function TestAIMetadataPage() {
  const [title, setTitle] = useState('Understanding Personal Injury Law: Your Guide to Getting the Compensation You Deserve');
  const [content, setContent] = useState(sampleContent);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

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

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Metadata Generation Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the AI-powered excerpt and meta description generation service.
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Enter an article title and content (or use the sample)</li>
              <li>Click "Generate Metadata" to create an excerpt and meta description</li>
              <li>Review the AI-generated content below</li>
              <li>Excerpt should be 150-200 characters</li>
              <li>Meta description should be 150-160 characters</li>
            </ol>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter article title"
            />
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={15}
              placeholder="Enter article content"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !title || !content}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? 'Generating...' : 'Generate Metadata'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="mt-8 space-y-6">
              {/* Excerpt */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Excerpt
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({result.excerpt?.length || 0} characters)
                  </span>
                </h3>
                <p className="text-gray-700 leading-relaxed">{result.excerpt}</p>
              </div>

              {/* Meta Description */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Meta Description
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({result.meta_description?.length || 0} characters)
                  </span>
                </h3>
                <p className="text-gray-700 leading-relaxed">{result.meta_description}</p>
              </div>

              {/* Preview */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Search Result Preview</h3>
                <div className="space-y-2">
                  <div className="text-blue-400 text-sm hover:underline cursor-pointer">
                    {title}
                  </div>
                  <div className="text-green-600 text-xs">
                    https://yourdomain.com/articles/your-article-slug
                  </div>
                  <div className="text-gray-300 text-sm">
                    {result.meta_description}
                  </div>
                </div>
              </div>

              {/* Raw JSON */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw Response</h3>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




