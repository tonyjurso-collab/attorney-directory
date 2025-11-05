'use client';

import { useState } from 'react';

interface TestCase {
  id: string;
  category: string;
  message: string;
  expectedFields: string[];
  shouldNotAsk: string[];
  description: string;
}

const testCases: TestCase[] = [
  // Personal Injury Tests
  {
    id: 'pi-car-accident',
    category: 'personal_injury_law',
    message: 'I was in a car accident yesterday and got injured',
    expectedFields: ['subcategory: car accident', 'bodily_injury: yes', 'date_of_incident: yesterday'],
    shouldNotAsk: ['sub_category', 'city', 'state'],
    description: 'Car accident with injury - should auto-detect subcategory and injury status'
  },
  {
    id: 'pi-slip-fall',
    category: 'personal_injury_law', 
    message: 'I slipped and fell at work last week',
    expectedFields: ['subcategory: slip and fall', 'date_of_incident: last week'],
    shouldNotAsk: ['sub_category', 'city', 'state'],
    description: 'Slip and fall - should auto-detect subcategory and date'
  },
  {
    id: 'pi-zip-code',
    category: 'personal_injury_law',
    message: 'I was hurt in a motorcycle accident. My zip code is 28202',
    expectedFields: ['subcategory: motorcycle accident', 'zip_code: 28202', 'city: Charlotte', 'state: NC'],
    shouldNotAsk: ['sub_category', 'city', 'state'],
    description: 'Motorcycle accident with zip - should auto-populate city/state'
  },

  // Family Law Tests
  {
    id: 'family-divorce',
    category: 'family_law',
    message: 'I need help with a divorce',
    expectedFields: ['subcategory: divorce'],
    shouldNotAsk: ['sub_category', 'city', 'state', 'bodily_injury', 'at_fault'],
    description: 'Divorce case - should auto-detect subcategory, no PI fields'
  },
  {
    id: 'family-custody',
    category: 'family_law',
    message: 'I need help with child custody issues',
    expectedFields: ['subcategory: child custody'],
    shouldNotAsk: ['sub_category', 'city', 'state', 'bodily_injury', 'at_fault'],
    description: 'Child custody - should auto-detect subcategory'
  },

  // Criminal Law Tests
  {
    id: 'criminal-dui',
    category: 'criminal_law',
    message: 'I got a DUI last night',
    expectedFields: ['subcategory: dui', 'date_of_incident: last night'],
    shouldNotAsk: ['sub_category', 'city', 'state', 'bodily_injury'],
    description: 'DUI case - should auto-detect subcategory and date'
  },
  {
    id: 'criminal-theft',
    category: 'criminal_law',
    message: 'I was charged with theft',
    expectedFields: ['subcategory: theft'],
    shouldNotAsk: ['sub_category', 'city', 'state', 'bodily_injury'],
    description: 'Theft charge - should auto-detect subcategory'
  },

  // Location Tests
  {
    id: 'location-zip-only',
    category: 'personal_injury_law',
    message: 'I was in an accident. Zip code 10001',
    expectedFields: ['zip_code: 10001', 'city: New York', 'state: NY'],
    shouldNotAsk: ['city', 'state'],
    description: 'Zip code only - should auto-populate city/state'
  },
  {
    id: 'location-city-state',
    category: 'personal_injury_law',
    message: 'I was injured in Los Angeles, California',
    expectedFields: ['city: Los Angeles', 'state: California'],
    shouldNotAsk: ['city', 'state'],
    description: 'City and state mentioned - should extract both'
  },

  // Yes/No Response Tests
  {
    id: 'yes-no-conservative',
    category: 'personal_injury_law',
    message: 'I was in a car accident',
    expectedFields: ['subcategory: car accident'],
    shouldNotAsk: ['sub_category'],
    description: 'Initial message - should only extract what is explicitly mentioned'
  },
  {
    id: 'yes-no-response',
    category: 'personal_injury_law',
    message: 'yes',
    expectedFields: [],
    shouldNotAsk: ['sub_category'],
    description: 'Simple yes response - should only apply to current question'
  }
];

export default function ChatbotTestSuite() {
  const [results, setResults] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const runSingleTest = async (testCase: TestCase) => {
    try {
      // Reset chat session
      await fetch('/api/chat/reset', { method: 'POST' });
      
      // Send test message
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testCase.message }),
      });
      
      const data = await response.json();
      
      return {
        testId: testCase.id,
        testCase,
        response: data,
        success: !data.error,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        testId: testCase.id,
        testCase,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);
    const testResults: any[] = [];

    for (const testCase of testCases) {
      setCurrentTest(testCase.id);
      const result = await runSingleTest(testCase);
      testResults.push(result);
      setResults([...testResults]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setRunning(false);
    setCurrentTest(null);
  };

  const runSpecificTest = async (testCase: TestCase) => {
    setCurrentTest(testCase.id);
    const result = await runSingleTest(testCase);
    setResults(prev => [...prev.filter(r => r.testId !== testCase.id), result]);
    setCurrentTest(null);
  };

  const analyzeResults = () => {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    
    const commonErrors = results
      .filter(r => !r.success)
      .map(r => r.error || 'Unknown error')
      .reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return { total, successful, failed, commonErrors };
  };

  const stats = analyzeResults();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Chatbot Test Suite</h1>
      
      {/* Test Controls */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <div className="flex gap-4 mb-4">
          <button
            onClick={runAllTests}
            disabled={running}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {running ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={() => setResults([])}
            disabled={running}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50"
          >
            Clear Results
          </button>
        </div>

        {running && currentTest && (
          <div className="text-sm text-blue-600">
            Running test: {currentTest}
          </div>
        )}
      </div>

      {/* Test Statistics */}
      {results.length > 0 && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Tests:</span> {stats.total}
            </div>
            <div>
              <span className="font-medium text-green-600">Successful:</span> {stats.successful}
            </div>
            <div>
              <span className="font-medium text-red-600">Failed:</span> {stats.failed}
            </div>
          </div>
          
          {Object.keys(stats.commonErrors).length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Common Errors:</h4>
              <ul className="text-sm">
                {(Object.entries(stats.commonErrors) as [string, number][]).map(([error, count]) => (
                  <li key={error} className="text-red-600">
                    {error} ({count} times)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Test Cases */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Test Cases</h3>
        <div className="grid gap-4">
          {testCases.map((testCase) => (
            <div key={testCase.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{testCase.description}</h4>
                  <p className="text-sm text-gray-600">Category: {testCase.category}</p>
                  <p className="text-sm text-gray-600">Message: "{testCase.message}"</p>
                </div>
                <button
                  onClick={() => runSpecificTest(testCase)}
                  disabled={running}
                  className="px-4 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                >
                  Test
                </button>
              </div>
              
              <div className="text-sm">
                <div className="mb-1">
                  <span className="font-medium">Expected Fields:</span>
                  <ul className="list-disc list-inside ml-4">
                    {testCase.expectedFields.map((field, i) => (
                      <li key={i} className="text-green-600">{field}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <span className="font-medium">Should NOT Ask:</span>
                  <ul className="list-disc list-inside ml-4">
                    {testCase.shouldNotAsk.map((field, i) => (
                      <li key={i} className="text-red-600">{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Test Results</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{result.testCase.description}</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {result.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">Message:</span> "{result.testCase.message}"
                  </div>
                  
                  {result.success ? (
                    <div>
                      <span className="font-medium">Response:</span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium text-red-600">Error:</span> {result.error}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {result.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
