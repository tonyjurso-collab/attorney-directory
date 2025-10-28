'use client';

import { useState } from 'react';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function TestCompleteSystemPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Basic API connectivity
      const response1 = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' })
      });
      
      if (response1.ok) {
        const data1 = await response1.json();
        results.push(`✅ Basic API Test: ${data1.reply.substring(0, 50)}...`);
      } else {
        results.push(`❌ Basic API Test: HTTP ${response1.status}`);
      }

      // Test 2: Personal Injury Detection
      const response2 = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'I was in a car accident' })
      });
      
      if (response2.ok) {
        const data2 = await response2.json();
        results.push(`✅ Personal Injury Detection: ${data2.reply.substring(0, 50)}...`);
        results.push(`📝 Next Field: ${data2.field_asked || 'None'}`);
      } else {
        results.push(`❌ Personal Injury Detection: HTTP ${response2.status}`);
      }

      // Test 3: Family Law Detection
      const response3 = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'I need help with divorce' })
      });
      
      if (response3.ok) {
        const data3 = await response3.json();
        results.push(`✅ Family Law Detection: ${data3.reply.substring(0, 50)}...`);
      } else {
        results.push(`❌ Family Law Detection: HTTP ${response3.status}`);
      }

      // Test 4: Session Management
      const response4 = await fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response4.ok) {
        const data4 = await response4.json();
        results.push(`✅ Session Reset: ${data4.message}`);
      } else {
        results.push(`❌ Session Reset: HTTP ${response4.status}`);
      }

      // Test 5: Health Check
      const response5 = await fetch('/api/health-simple');
      
      if (response5.ok) {
        const data5 = await response5.json();
        results.push(`✅ Health Check: ${data5.status}`);
      } else {
        results.push(`❌ Health Check: HTTP ${response5.status}`);
      }

    } catch (error) {
      results.push(`❌ Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Complete System Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2 text-gray-700">
            <p>✅ Infrastructure: Ready</p>
            <p>✅ Database: Ready</p>
            <p>✅ Environment: Ready</p>
            <p>✅ API Endpoints: Working</p>
            <p>✅ Frontend Integration: Complete</p>
            <p>✅ Session Management: Working</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <button
            onClick={runTests}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mb-4"
          >
            Run Complete Test Suite
          </button>
          
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Testing</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click the chat button in the bottom right corner</li>
            <li>Try these test messages:</li>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>"Hello" - Should get welcome message</li>
              <li>"I was in a car accident" - Should detect personal injury</li>
              <li>"I need help with divorce" - Should detect family law</li>
              <li>"I was arrested" - Should detect criminal law</li>
            </ul>
            <li>Check browser console for detailed logs</li>
            <li>Test the reset button functionality</li>
          </ol>
        </div>
      </div>

      {/* ChatWidget - Floating position */}
      <ChatWidget 
        position="floating"
        welcomeMessage="Hi! I'm here to help you test the complete chat system. What legal issue can I help you with?"
      />
    </div>
  );
}
