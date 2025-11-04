'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useEffect } from 'react';

interface ArticleEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  autoSaveKey?: string; // localStorage key for auto-save
  minHeight?: string;
}

export function ArticleEditor({
  content = '',
  onChange,
  placeholder = 'Start writing your article...',
  autoSaveKey,
  minHeight = '400px'
}: ArticleEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Don't include hard breaks (we want paragraph breaks)
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  // Auto-save to localStorage
  useEffect(() => {
    if (!editor || !autoSaveKey) return;

    const interval = setInterval(() => {
      const html = editor.getHTML();
      if (html && html !== '<p></p>') {
        localStorage.setItem(autoSaveKey, html);
      }
    }, 5000); // Auto-save every 5 seconds

    return () => clearInterval(interval);
  }, [editor, autoSaveKey]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!editor || !autoSaveKey) return;

    const saved = localStorage.getItem(autoSaveKey);
    if (saved && !content) {
      editor.commands.setContent(saved);
    }
  }, [editor, autoSaveKey, content]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const setHeading = useCallback((level: 2 | 3 | 4) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  }, [editor]);

  const setParagraph = useCallback(() => {
    editor?.chain().focus().setParagraph().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const setHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const wordCount = editor.storage.characterCount.characters();

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex border-r border-gray-300 pr-2 mr-2 gap-1">
          <button
            onClick={toggleBold}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-300' : ''
            }`}
            title="Bold"
            type="button"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={toggleItalic}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-300' : ''
            }`}
            title="Italic"
            type="button"
          >
            <span className="italic">I</span>
          </button>
        </div>

        {/* Headings */}
        <div className="flex border-r border-gray-300 pr-2 mr-2 gap-1">
          <button
            onClick={() => setHeading(2)}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 2"
            type="button"
          >
            H2
          </button>
          <button
            onClick={() => setHeading(3)}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 3"
            type="button"
          >
            H3
          </button>
          <button
            onClick={() => setHeading(4)}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 4 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 4"
            type="button"
          >
            H4
          </button>
          <button
            onClick={setParagraph}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('paragraph') ? 'bg-gray-300' : ''
            }`}
            title="Paragraph"
            type="button"
          >
            P
          </button>
        </div>

        {/* Lists */}
        <div className="flex border-r border-gray-300 pr-2 mr-2 gap-1">
          <button
            onClick={toggleBulletList}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-300' : ''
            }`}
            title="Bullet List"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <button
            onClick={toggleOrderedList}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-300' : ''
            }`}
            title="Numbered List"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <button
            onClick={toggleBlockquote}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('blockquote') ? 'bg-gray-300' : ''
            }`}
            title="Quote"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 01-8 0V9a4 4 0 118 0v1zm-4 2a1 1 0 100-2 1 1 0 000 2zm-4 2h8a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={setHorizontalRule}
            className="px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Horizontal Line"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Character Count */}
        <div className="ml-auto flex items-center px-3 text-sm text-gray-500">
          {wordCount.toLocaleString()} characters
        </div>
      </div>

      {/* Editor */}
      <div style={{ minHeight }} className="p-6 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
