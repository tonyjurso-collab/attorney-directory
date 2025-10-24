import { LeadFormData } from '@/lib/types/database';

const LEADPROSPER_API_BASE = 'https://api.leadprosper.com/v1';

export interface LeadProsperResponse {
  success: boolean;
  lead_id?: string;
  message?: string;
  error?: string;
}

export async function submitLeadToLeadProsper(
  leadData: LeadFormData,
  attorneyId?: string
): Promise<LeadProsperResponse> {
  try {
    const response = await fetch(`${LEADPROSPER_API_BASE}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LEADPROSPER_API_KEY}`,
      },
      body: JSON.stringify({
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone,
        zip_code: leadData.zip_code,
        practice_area_id: leadData.practice_area_id,
        case_description: leadData.case_description,
        case_value: leadData.case_value,
        urgency: leadData.urgency,
        attorney_id: attorneyId,
        source: 'attorney-directory',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`LeadProsper API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      lead_id: result.lead_id,
      message: result.message,
    };
  } catch (error) {
    console.error('Error submitting lead to LeadProsper:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getLeadStatus(leadId: string): Promise<LeadProsperResponse> {
  try {
    const response = await fetch(`${LEADPROSPER_API_BASE}/leads/${leadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.LEADPROSPER_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`LeadProsper API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      lead_id: result.lead_id,
      message: result.status,
    };
  } catch (error) {
    console.error('Error fetching lead status from LeadProsper:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
