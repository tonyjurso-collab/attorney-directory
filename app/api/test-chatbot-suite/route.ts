import { NextRequest, NextResponse } from 'next/server';

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

  // Criminal Law Tests
  {
    id: 'criminal-dui',
    category: 'criminal_law',
    message: 'I got a DUI last night',
    expectedFields: ['subcategory: dui', 'date_of_incident: last night'],
    shouldNotAsk: ['sub_category', 'city', 'state', 'bodily_injury'],
    description: 'DUI case - should auto-detect subcategory and date'
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

  // Yes/No Response Tests
  {
    id: 'yes-no-conservative',
    category: 'personal_injury_law',
    message: 'I was in a car accident',
    expectedFields: ['subcategory: car accident'],
    shouldNotAsk: ['sub_category'],
    description: 'Initial message - should only extract what is explicitly mentioned'
  }
];

export async function POST(request: NextRequest) {
  try {
    const results: any[] = [];
    
    for (const testCase of testCases) {
      try {
        // Reset chat session
        await fetch(`${request.nextUrl.origin}/api/chat/reset`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Send test message
        const response = await fetch(`${request.nextUrl.origin}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: testCase.message }),
        });
        
        const data = await response.json();
        
        // Analyze the response
        const analysis = {
          testId: testCase.id,
          testCase,
          response: data,
          success: !data.error,
          timestamp: new Date().toISOString(),
          analysis: {
            hasError: !!data.error,
            extractedFields: Object.keys(data.debug?.collected || {}),
            categoryDetected: data.debug?.category,
            subcategoryDetected: data.debug?.subcategory,
            nextQuestion: data.answer,
            submitLead: data.submit_lead,
            leadData: data.lead_data
          }
        };
        
        results.push(analysis);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        results.push({
          testId: testCase.id,
          testCase,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate summary
    const summary = {
      totalTests: results.length,
      successfulTests: results.filter((r: any) => r.success).length,
      failedTests: results.filter((r: any) => !r.success).length,
      commonIssues: results
        .filter((r: any) => !r.success)
        .map((r: any) => r.error || 'Unknown error')
        .reduce((acc: Record<string, number>, error: string) => {
          acc[error] = (acc[error] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      fieldExtractionIssues: results
        .filter((r: any) => r.success && r.analysis)
        .map((r: any) => ({
          testId: r.testId,
          extractedFields: r.analysis.extractedFields,
          expectedFields: r.testCase.expectedFields,
          categoryDetected: r.analysis.categoryDetected,
          subcategoryDetected: r.analysis.subcategoryDetected
        }))
    };

    return NextResponse.json({
      summary,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test suite error:', error);
    return NextResponse.json(
      { 
        error: 'Test suite failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
