import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitLeadToLeadProsper } from '@/lib/leadprosper/client';
import { LeadData } from '@/lib/chat/services/lead-generation-supabase.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Received lead submission:', body);
    
    // Get client information from request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    console.log('📋 Request metadata:', { ipAddress, userAgent, referer });
    
    // Get practice area configuration from database
    const supabase = await createClient();
    
    const { data: practiceArea, error: practiceAreaError } = await supabase
      .from('practice_area_categories')
      .select('lp_campaign_id, lp_supplier_id, lp_key, lp_config')
      .eq('slug', body.practice_area || 'general_legal_assistance')
      .single();
    
    if (practiceAreaError || !practiceArea) {
      console.error('❌ Error fetching practice area config:', practiceAreaError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid practice area configuration' 
        },
        { status: 400 }
      );
    }
    
    if (!practiceArea.lp_campaign_id || !practiceArea.lp_supplier_id || !practiceArea.lp_key) {
      console.error('❌ Missing LeadProsper configuration for practice area');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Practice area not configured for lead submission' 
        },
        { status: 400 }
      );
    }
    
    // Generate session ID for this direct lead submission
    const sessionId = `lead-submit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    
    // Build LeadProsper submission payload with all required fields
    const leadProsperPayload: LeadData = {
      sid: sessionId,
      lp_campaign_id: practiceArea.lp_campaign_id,
      lp_supplier_id: practiceArea.lp_supplier_id,
      lp_key: practiceArea.lp_key,
      first_name: body.first_name || '',
      last_name: body.last_name || '',
      email: body.email || '',
      phone: body.phone || '',
      describe: body.describe || body.case_description || '',
      city: body.city || '',
      state: body.state || '',
      zip_code: body.zip_code || '',
      main_category: body.practice_area || body.main_category || '',
      sub_category: body.sub_category || body.subcategory || '',
      // Server-side required fields
      ip_address: ipAddress || '0.0.0.0',
      user_agent: userAgent,
      landing_page_url: referer || 'https://www.attorney-directory.com',
      jornaya_leadid: body.jornaya_leadid || 'test-jornaya-id',
      trustedform_cert_url: body.trustedform_cert_url || 'https://trustedform.com/cert_url',
      tcpa_text: body.tcpa_text || 'I consent to be contacted by phone and email.',
    };
    
    // Add additional fields based on practice area requirements
    const lpConfig = practiceArea.lp_config as any;
    if (lpConfig?.required_fields) {
      // Add any additional required fields from the config
      Object.keys(lpConfig.required_fields).forEach((fieldName: string) => {
        if ((body as any)[fieldName] && fieldName !== 'lp_campaign_id' && fieldName !== 'lp_supplier_id' && fieldName !== 'lp_key') {
          (leadProsperPayload as any)[fieldName] = (body as any)[fieldName];
        }
      });
    }
    
    // Submit to LeadProsper API
    const result = await submitLeadToLeadProsper(leadProsperPayload);
    
    if (result.success) {
      console.log('✅ Lead submitted successfully to LeadProsper, ID:', result.leadId);
      
      // Also store lead in database for tracking
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          practice_area_id: practiceArea.id,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone: body.phone,
          zip_code: body.zip_code,
          case_description: body.describe || '',
          source: 'website',
          status: 'new',
          leadprosper_lead_id: result.leadId,
        });
      
      if (leadError) {
        console.error('⚠️ Lead saved to LeadProsper but failed to save to database:', leadError);
      }
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Your inquiry has been submitted successfully. We\'ll be in touch soon!',
          lead_id: result.lead_id
        },
        { status: 200 }
      );
    } else {
      console.error('❌ Failed to submit lead to LeadProsper:', result.error);
      
      // Try to save to database anyway
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          practice_area_id: practiceArea.id,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone: body.phone,
          zip_code: body.zip_code,
          case_description: body.describe || '',
          source: 'website',
          status: 'new',
        });
      
      if (!leadError) {
        console.log('✅ Lead saved to database as backup');
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'There was an error submitting your form. Please try again.' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error processing lead submission:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'There was an error submitting your form. Please try again.' 
      },
      { status: 500 }
    );
  }
}
