import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    
    console.log('Submitting lead to LeadProsper:', leadData);
    
    // Get LeadProsper configuration for this category
    const category = leadData.category;
    const config = await getLeadProsperConfig(category);
    
    if (!config) {
      throw new Error(`No LeadProsper configuration found for category: ${category}`);
    }
    
    // Prepare LeadProsper payload
    const leadProsperPayload = {
      campaign_id: config.lp_campaign_id,
      supplier_id: config.lp_supplier_id,
      key: config.lp_key,
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      phone: leadData.phone,
      email: leadData.email,
      zip_code: leadData.zip_code,
      describe: leadData.describe,
      category: leadData.category,
      subcategory: leadData.subcategory,
      date_of_incident: leadData.date_of_incident,
      bodily_injury: leadData.bodily_injury,
      at_fault: leadData.at_fault,
      has_attorney: leadData.has_attorney,
      // Required fields for LeadProsper
      ip_address: getClientIP(request),
      user_agent: request.headers.get('user-agent') || '',
      landing_page_url: request.headers.get('referer') || '',
      jornaya_leadid: generateJornayaLeadId(),
      trustedform_cert_url: generateTrustedFormCert(),
      tcpa_text: 'By submitting this form, I agree to be contacted by LegalHub and its partners via phone, text, and email.',
    };
    
    console.log('LeadProsper payload:', leadProsperPayload);
    
    // Submit to LeadProsper API
    const leadProsperResponse = await fetch('https://api.leadprosper.io/direct_post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadProsperPayload),
    });
    
    if (!leadProsperResponse.ok) {
      const errorText = await leadProsperResponse.text();
      throw new Error(`LeadProsper API error: ${leadProsperResponse.status} - ${errorText}`);
    }
    
    const leadProsperResult = await leadProsperResponse.json();
    
    console.log('LeadProsper response:', leadProsperResult);
    
    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully to LeadProsper',
      lead_id: leadProsperResult.lead_id || `lead_${Date.now()}`,
      leadprosper_response: leadProsperResult,
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to submit lead to LeadProsper',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getLeadProsperConfig(category: string) {
  // For now, return mock config - you'll need to implement database lookup
  const mockConfigs = {
    personal_injury_law: {
      lp_campaign_id: 'PI001',
      lp_supplier_id: 'SUP001',
      lp_key: 'your-leadprosper-key',
    },
    family_law: {
      lp_campaign_id: 'FL001',
      lp_supplier_id: 'SUP001', 
      lp_key: 'your-leadprosper-key',
    },
    criminal_law: {
      lp_campaign_id: 'CL001',
      lp_supplier_id: 'SUP001',
      lp_key: 'your-leadprosper-key',
    },
  };
  
  return mockConfigs[category as keyof typeof mockConfigs] || null;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || '127.0.0.1';
}

function generateJornayaLeadId(): string {
  // Generate a mock Jornaya LeadID - in production, this would come from Jornaya tracking
  return `jornaya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTrustedFormCert(): string {
  // Generate a mock TrustedForm certificate URL - in production, this would come from TrustedForm
  return `https://cert.trustedform.com/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
