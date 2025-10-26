'use client';

import { useState } from 'react';

export default function TestChatbot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await res.json();
      setResponse(data);
      console.log('Chatbot response:', data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    try {
      await fetch('/api/chat/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setResponse(null);
      console.log('Chat reset');
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Chatbot</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Message:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Try: 'I was in a car accident yesterday'"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
          
          <button
            onClick={resetChat}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg"
          >
            Reset Chat
          </button>
        </div>
        
        {response && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Response:</h3>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Cases:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>"I was in a car accident yesterday" - Should auto-detect subcategory: car accident</li>
          <li>"I need help with a divorce" - Should auto-detect subcategory: divorce</li>
          <li>"My zip code is 28202" - Should auto-populate city: Charlotte, state: NC</li>
          <li>"I was injured in a slip and fall" - Should auto-detect subcategory: slip and fall</li>
        </ul>
      </div>
    </div>
  );
}
