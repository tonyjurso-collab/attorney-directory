import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, ChatSession } from '@/lib/chat/session';
import { extractFieldsFromMessage } from '@/lib/chat/openai-extractor';
import { getNextQuestion } from '@/lib/chat/conversation-manager';
import { validateEmail, validatePhone, validateZipCode, formatPhone, formatZipCode } from '@/lib/utils/validation';

function determineFieldFromQuestion(question: string): string | null {
  const fieldPatterns: Record<string, RegExp> = {
    'at_fault': /were you at fault/i,
    'has_attorney': /do you (currently )?have an attorney/i,
    'bodily_injury': /were you (injured|hurt)/i,
    'first_name': /what'?s your first name/i,
    'last_name': /what'?s your last name/i,
    'phone': /phone number/i,
    'email': /email/i,
    'zip_code': /zip code/i,
    'date_of_incident': /when did (this|it) happen/i,
  };
  
  for (const [field, pattern] of Object.entries(fieldPatterns)) {
    if (pattern.test(question)) {
      return field;
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    const session = await getIronSession<ChatSession>(await cookies(), sessionOptions);
    
    // Initialize session if new
    if (!session.collectedFields) {
      session.collectedFields = {};
      session.conversationHistory = [];
      session.conversationStep = 'collecting_fields';
      console.log('New chat session created');
    } else {
      console.log('Existing session found:', {
        collectedFields: Object.keys(session.collectedFields),
        historyLength: session.conversationHistory?.length,
        step: session.conversationStep
      });
    }
    
    // Add user message to history
    session.conversationHistory!.push({ role: 'user', content: message });
    
    // Determine what field we're currently asking about
    const lastQuestion = session.conversationHistory!.length > 1 
      ? session.conversationHistory![session.conversationHistory!.length - 2]
      : null;
    
    const currentField = lastQuestion?.role === 'assistant' 
      ? determineFieldFromQuestion(lastQuestion.content)
      : null;
    
    console.log('Processing message:', {
      message,
      currentFields: Object.keys(session.collectedFields!),
      historyLength: session.conversationHistory!.length,
      currentField
    });
    
    // Extract fields using AI
    const extraction = await extractFieldsFromMessage(
      message,
      session.conversationHistory!,
      [], // We'll determine required fields based on category
      currentField || undefined // Pass the current field being asked about
    );
    
    console.log('Extraction completed:', {
      extractedCount: Object.keys(extraction.extractedFields).length,
      extractedFields: Object.keys(extraction.extractedFields), // Added for debugging
      category: extraction.category,
      subcategory: extraction.subcategory,
      isLegalQuestion: extraction.isLegalQuestion
    });
    
    // Handle legal question disclaimer - we'll add it to the response instead of returning early
    
    // Merge extracted fields into session - only update fields that are not already set and have actual values
    for (const [key, value] of Object.entries(extraction.extractedFields)) {
      // Only set field if it doesn't exist or is empty, AND the value is not empty
      const hasValue = value !== undefined && value !== null && value !== '' && 
                      (typeof value !== 'string' || value.trim() !== '');
      
      if (!session.collectedFields![key] || session.collectedFields![key] === '') {
        if (hasValue) {
          session.collectedFields![key] = value;
          console.log(`Setting field ${key} to:`, value);
        }
      }
    }
    
    // Validate and format specific fields
    const validationErrors: Record<string, string> = {};
    
    // Validate email
    if (session.collectedFields!.email) {
      const emailValidation = validateEmail(session.collectedFields!.email);
      if (!emailValidation.isValid) {
        validationErrors.email = emailValidation.error!;
        // Clear invalid email
        delete session.collectedFields!.email;
      }
    }
    
    // Validate and format phone
    if (session.collectedFields!.phone) {
      const phoneValidation = validatePhone(session.collectedFields!.phone);
      if (!phoneValidation.isValid) {
        validationErrors.phone = phoneValidation.error!;
        // Clear invalid phone
        delete session.collectedFields!.phone;
      } else {
        // Format valid phone number
        session.collectedFields!.phone = formatPhone(session.collectedFields!.phone);
      }
    }
    
    // Validate and format ZIP code
    if (session.collectedFields!.zip_code) {
      const zipValidation = validateZipCode(session.collectedFields!.zip_code);
      if (!zipValidation.isValid) {
        validationErrors.zip_code = zipValidation.error!;
        // Clear invalid ZIP code
        delete session.collectedFields!.zip_code;
      } else {
        // Format valid ZIP code
        session.collectedFields!.zip_code = formatZipCode(session.collectedFields!.zip_code);
      }
    }
    
    // If there are validation errors, return error message for the first invalid field
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorMessage = validationErrors[firstErrorField];
      
      // Add error message to history
      session.conversationHistory!.push({ role: 'assistant', content: errorMessage });
      
      await session.save();
      
      return NextResponse.json({
        answer: errorMessage,
        submit_lead: false,
        lead_data: null,
        validation_error: true,
        field: firstErrorField
      });
    }
    
    console.log('After merge - collected fields:', Object.keys(session.collectedFields!));
    console.log('Field values:', {
      bodily_injury: session.collectedFields?.bodily_injury,
      at_fault: session.collectedFields?.at_fault,
      has_attorney: session.collectedFields?.has_attorney,
    });
    
    // Update category and subcategory if detected
    if (extraction.category) {
      session.category = extraction.category;
      // Auto-populate main_category from detected category
      session.collectedFields!.main_category = extraction.category;
      console.log(`Auto-populated main_category: ${extraction.category}`);
    }
    if (extraction.subcategory) {
      session.subcategory = extraction.subcategory;
      // Auto-populate sub_category from detected subcategory
      session.collectedFields!.sub_category = extraction.subcategory;
      console.log(`Auto-populated sub_category: ${extraction.subcategory}`);
    }
    
    // Determine next question
    const next = getNextQuestion(
      session.collectedFields, 
      session.category || 'general'
    );
    
    console.log('Next question determined:', {
      hasNext: !!next,
      field: next?.field,
      totalFields: Object.keys(session.collectedFields).length,
      collectedFields: session.collectedFields,
      category: session.category
    });
    
    let response: string;
    let submitLead = false;
    let leadData = null;
    
    // Check if we need to show disclaimer first
    const shouldShowDisclaimer = extraction.isLegalQuestion && session.conversationHistory!.length <= 2;
    
    if (!next) {
      // All fields collected - trigger consent modal immediately WITHOUT intermediate message
      session.conversationStep = 'ready_to_submit';
      
      // Don't send a separate thank you message - the consent modal will handle that
      response = '';
      
      // Prepare lead data for consent modal
      leadData = {
        ...session.collectedFields,
        category: session.category,
        subcategory: session.subcategory,
      };
      submitLead = true;
      console.log('Ready to submit lead - showing consent modal immediately');
    } else {
      response = next.question;
    }
    
    // If we showed a disclaimer, we need to return both the disclaimer and the next question
    if (shouldShowDisclaimer && next) {
      const disclaimerMessage = "I can't provide legal advice, but I can connect you with an attorney who can help. Let me get some information from you first.";
      response = `${disclaimerMessage}\n\n${next.question}`;
    }
    
    // Add assistant response to history
    session.conversationHistory!.push({ role: 'assistant', content: response });
    
    await session.save();
    
    console.log('Session step:', session.conversationStep);
    console.log('Session saved with fields:', Object.keys(session.collectedFields!));
    console.log('Session data:', JSON.stringify(session, null, 2));
    
    return NextResponse.json({
      answer: response,
      submit_lead: submitLead,
      lead_data: leadData,
      debug: {
        collected: session.collectedFields,
        category: session.category,
        subcategory: session.subcategory,
        missing: next ? [next.field] : [],
        totalFields: Object.keys(session.collectedFields).length
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred processing your message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
