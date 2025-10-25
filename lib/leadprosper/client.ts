const LEADPROSPER_API_URL = 'https://api.leadprosper.io/direct_post';

export interface LeadProsperSubmission {
  lp_campaign_id: number;
  lp_supplier_id: number;
  lp_key: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip_code: string;
  describe?: string;
  [key: string]: any; // Allow additional fields
}

export interface LeadProsperResponse {
  success: boolean;
  lead_id?: string;
  message?: string;
  error?: string;
  status?: string;
}

export async function submitLeadToLeadProsper(
  data: LeadProsperSubmission
): Promise<LeadProsperResponse> {
  try {
    console.log('📤 Submitting lead to LeadProsper:', data);
    
    // Build URL with hash key as query parameter
    const url = `${LEADPROSPER_API_URL}?hash=${data.lp_key}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ LeadProsper API error:', response.status, responseData);
      return {
        success: false,
        error: responseData.message || responseData.error || `HTTP ${response.status}`,
        status: responseData.status,
      };
    }

    console.log('✅ Lead submitted successfully to LeadProsper:', responseData);
    
    return {
      success: true,
      lead_id: responseData.lead_id || responseData.id,
      message: responseData.message || 'Lead submitted successfully',
      status: responseData.status,
    };
  } catch (error) {
    console.error('❌ Error submitting lead to LeadProsper:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function validateLeadProsperCampaign(
  campaignId: number,
  supplierId: number,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch(LEADPROSPER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lp_campaign_id: campaignId,
        lp_supplier_id: supplierId,
        lp_key: apiKey,
        first_name: 'Test',
        last_name: 'Validation',
        email: 'test@example.com',
        phone: '1234567890',
        city: 'Test',
        state: 'CA',
        zip_code: '12345',
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
