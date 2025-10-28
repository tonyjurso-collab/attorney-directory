'use client';

import { ChatWidget } from '@/components/chat/ChatWidget';

export default function TestChatWidgetPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test ChatWidget with New API
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click the chat button in the bottom right corner</li>
            <li>Send a test message like "Hello, I need help with a legal issue"</li>
            <li>Check the browser console for API response logs</li>
            <li>Verify the new API contract is working</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Status:</h2>
          <div className="space-y-2 text-gray-700">
            <p>✅ ChatWidget updated to use new API contract</p>
            <p>✅ Using /api/chat endpoint</p>
            <p>✅ New response format: reply, complete, session_id, debug</p>
            <p>✅ Error handling updated</p>
            <p>✅ Field collection logic updated</p>
          </div>
        </div>
      </div>

      {/* ChatWidget - Floating position */}
      <ChatWidget 
        position="floating"
        welcomeMessage="Hi! I'm here to help you test the new chat system. What legal issue can I help you with?"
      />
    </div>
  );
}
