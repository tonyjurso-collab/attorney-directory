'use client';

import { useState } from 'react';
import { ArticleEditor } from '@/components/articles/ArticleEditor';

export default function TestArticleEditorPage() {
  const [content, setContent] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');

  const handleChange = (newContent: string) => {
    setContent(newContent);
  };

  const showOutput = () => {
    setHtmlOutput(content);
  };

  const clearEditor = () => {
    setContent('');
    setHtmlOutput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Article Editor Test Page
          </h1>
          <p className="text-gray-600 mb-8">
            Test the rich text editor component with all formatting options.
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Type some content in the editor</li>
              <li>Use the toolbar buttons to format your text</li>
              <li>Click "Show HTML Output" to see the generated HTML</li>
              <li>Check browser console for auto-save messages</li>
              <li>Refresh the page - content should be restored from localStorage</li>
            </ol>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={showOutput}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show HTML Output
            </button>
            <button
              onClick={clearEditor}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Editor
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rich Text Editor</h2>
          <ArticleEditor
            content={content}
            onChange={handleChange}
            autoSaveKey="test-article-editor"
            minHeight="400px"
          />
        </div>

        {/* Output Preview */}
        {htmlOutput && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">HTML Output</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Rendered HTML:</p>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: htmlOutput }} className="prose max-w-none" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Raw HTML Code:</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                {htmlOutput}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



