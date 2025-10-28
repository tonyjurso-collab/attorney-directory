import { LeadData } from '@/lib/chat/services/lead-generation-supabase.service';

// LeadProsper API response interface
export interface LeadProsperResponse {
  success: boolean;
  leadId?: string;
  status?: string;
  code?: number;
  message?: string;
  error?: string;
  statusCode?: number;
  responseTime?: number;
}

// LeadProsper client configuration
const LEADPROSPER_CONFIG = {
  apiUrl: process.env.LEADPROSPER_API_URL || 'https://api.leadprosper.io',
  apiKey: process.env.LEADPROSPER_API_KEY || '',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
};

/**
 * Submit lead to LeadProsper API
 */
export async function submitLeadToLeadProsper(leadData: LeadData): Promise<LeadProsperResponse> {
  const startTime = Date.now();
  
  if (!LEADPROSPER_CONFIG.apiKey) {
    return {
      success: false,
      error: 'LeadProsper API key not configured',
      responseTime: Date.now() - startTime,
    };
  }
  
  try {
    console.log(`📤 Submitting lead to LeadProsper:`, {
      campaignId: leadData.lp_campaign_id,
      supplierId: leadData.lp_supplier_id,
      category: leadData.main_category,
      firstName: leadData.first_name,
      email: leadData.email,
    });
    
    // Debug: Log the complete lead data being sent
    console.log('🔍 COMPLETE LEAD DATA BEING SENT TO LEADPROSPER:', JSON.stringify(leadData, null, 2));
    
    // Prepare request body
    const requestBody = prepareLeadProsperPayload(leadData);
    
    // Debug: Log the prepared payload
    console.log('🔍 PREPARED PAYLOAD FOR LEADPROSPER:', JSON.stringify(requestBody, null, 2));
    
    // Make API request with retry logic
    const response = await makeRequestWithRetry(requestBody);
    
    // Debug: Log the complete response from LeadProsper
    console.log('🔍 COMPLETE RESPONSE FROM LEADPROSPER:', JSON.stringify(response, null, 2));
    
    const responseTime = Date.now() - startTime;
    
    if (response.success) {
      console.log(`✅ Lead submitted successfully to LeadProsper (${responseTime}ms):`, {
        leadId: response.leadId,
        campaignId: leadData.lp_campaign_id,
      });
    } else {
      console.error(`❌ Lead submission failed to LeadProsper (${responseTime}ms):`, {
        error: response.error,
        statusCode: response.statusCode,
        campaignId: leadData.lp_campaign_id,
      });
    }
    
    return {
      ...response,
      responseTime,
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ LeadProsper submission error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
}

/**
 * Prepare payload for LeadProsper API
 */
function prepareLeadProsperPayload(leadData: LeadData): Record<string, any> {
  // Format phone number to (xxx) xxx-xxxx format
  const formatPhone = (phone: string | undefined): string => {
    if (!phone) return '';
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Format as (xxx) xxx-xxxx
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone; // Return original if not 10 digits
  };

  // Map our lead data to LeadProsper expected format
  const payload: Record<string, any> = {
    // Required fields - use exact field names expected by LeadProsper
    lp_campaign_id: leadData.lp_campaign_id,
    lp_supplier_id: leadData.lp_supplier_id,
    lp_key: leadData.lp_key,
    
    // Contact information
    first_name: leadData.first_name,
    last_name: leadData.last_name,
    email: leadData.email,
    phone: formatPhone(leadData.phone),
    
    // Location
    city: leadData.city,
    state: leadData.state,
    zip_code: leadData.zip_code,
    
    // Case details
    main_category: leadData.main_category,
    sub_category: leadData.sub_category || '',
    describe: leadData.describe,
    
    // Tracking fields
    ip_address: leadData.ip_address || '',
    user_agent: leadData.user_agent || '',
    landing_page_url: leadData.landing_page_url || '',
    
    // Compliance fields
    jornaya_leadid: leadData.jornaya_leadid || '',
    trustedform_cert_url: leadData.trustedform_cert_url || '',
    tcpa_text: leadData.tcpa_text || '',
  };
  
  // Dynamic field passthrough - include all other fields from leadData
  for (const [key, value] of Object.entries(leadData)) {
    // Skip fields already mapped above to avoid duplicates
    if (!payload.hasOwnProperty(key) && value !== undefined && value !== null && value !== '') {
      payload[key] = value;
    }
  }
  
  // Remove empty fields to clean up payload
  const cleanedPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== '') {
      cleanedPayload[key] = value;
    }
  }
  
  return cleanedPayload;
}

/**
 * Make API request with retry logic
 */
async function makeRequestWithRetry(payload: Record<string, any>): Promise<LeadProsperResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= LEADPROSPER_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`🔄 LeadProsper API attempt ${attempt}/${LEADPROSPER_CONFIG.retryAttempts}`);
      
      // Debug: Log the HTTP request details
      console.log('🌐 HTTP REQUEST TO LEADPROSPER:', {
        url: `${LEADPROSPER_CONFIG.apiUrl}/direct_post`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LEADPROSPER_CONFIG.apiKey ? '***HIDDEN***' : 'NOT_SET'}`,
          'User-Agent': 'AttorneyDirectory/2.0',
        },
        body: JSON.stringify(payload),
      });

      const response = await fetch(`${LEADPROSPER_CONFIG.apiUrl}/direct_post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LEADPROSPER_CONFIG.apiKey}`,
          'User-Agent': 'AttorneyDirectory/2.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(LEADPROSPER_CONFIG.timeout),
      });
      
      // Debug: Log the HTTP response details
      console.log('🌐 HTTP RESPONSE FROM LEADPROSPER:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      const responseData = await response.json();
      
      // Debug: Log the response data
      console.log('🌐 RESPONSE DATA FROM LEADPROSPER:', JSON.stringify(responseData, null, 2));
      
      if (response.ok) {
        return {
          success: true,
          leadId: responseData.lead_id || responseData.id,
          status: responseData.status,
          code: responseData.code,
          message: responseData.message || 'Lead submitted successfully',
          statusCode: response.status,
        };
      } else {
        // Handle specific error cases
        const errorMessage = responseData.error || responseData.message || `HTTP ${response.status}`;
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            error: errorMessage,
            statusCode: response.status,
          };
        }
        
        // Server errors (5xx) - will retry
        lastError = new Error(errorMessage);
        
        if (attempt < LEADPROSPER_CONFIG.retryAttempts) {
          const delay = LEADPROSPER_CONFIG.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on timeout or network errors immediately
      if (error instanceof Error && (
        error.name === 'AbortError' || 
        error.message.includes('timeout') ||
        error.message.includes('network')
      )) {
        if (attempt < LEADPROSPER_CONFIG.retryAttempts) {
          const delay = LEADPROSPER_CONFIG.retryDelay * attempt;
          console.log(`⏳ Network error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else {
        // Other errors - don't retry
        break;
      }
    }
  }
  
  return {
    success: false,
    error: lastError?.message || 'Max retry attempts exceeded',
    statusCode: 500,
  };
}

/**
 * Test LeadProsper API connection
 */
export async function testLeadProsperConnection(): Promise<{
  success: boolean;
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  
  if (!LEADPROSPER_CONFIG.apiKey) {
    return {
      success: false,
      message: 'LeadProsper API key not configured',
    };
  }
  
  try {
    const response = await fetch(`${LEADPROSPER_CONFIG.apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LEADPROSPER_CONFIG.apiKey}`,
        'User-Agent': 'AttorneyDirectory/2.0',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout for health check
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        success: true,
        message: 'LeadProsper API connection successful',
        responseTime,
      };
    } else {
      return {
        success: false,
        message: `LeadProsper API returned ${response.status}`,
        responseTime,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
}

/**
 * Get LeadProsper configuration status
 */
export function getLeadProsperConfig(): {
  apiUrl: string;
  hasApiKey: boolean;
  timeout: number;
  retryAttempts: number;
} {
  return {
    apiUrl: LEADPROSPER_CONFIG.apiUrl,
    hasApiKey: !!LEADPROSPER_CONFIG.apiKey,
    timeout: LEADPROSPER_CONFIG.timeout,
    retryAttempts: LEADPROSPER_CONFIG.retryAttempts,
  };
}

/**
 * Validate lead data before submission
 */
export function validateLeadForSubmission(leadData: LeadData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Required fields validation
  const requiredFields = [
    'lp_campaign_id',
    'lp_supplier_id',
    'lp_key',
    'first_name',
    'last_name',
    'email',
    'phone',
    'city',
    'state',
    'zip_code',
    'main_category',
    'describe',
  ];
  
  for (const field of requiredFields) {
    const value = leadData[field as keyof LeadData];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Email format validation
  if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
    errors.push('Invalid email format');
  }
  
  // Phone format validation
  if (leadData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(leadData.phone)) {
    errors.push('Invalid phone format');
  }
  
  // ZIP code validation
  if (leadData.zip_code && !/^\d{5}(-\d{4})?$/.test(leadData.zip_code)) {
    errors.push('Invalid ZIP code format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}