import { NextRequest, NextResponse } from 'next/server';
import { submitLeadToLeadProsper } from '@/lib/leadprosper/client';
import { LeadData } from '@/lib/chat/services/lead-generation-supabase.service';
import practiceAreasConfig from '@/chat/practice_areas_config.json';
import { getCityStateFromZipCode } from '@/lib/utils/zipcode-geocoding';

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    
    console.log('📤 Lead submission data:', leadData);
    console.log('🔍 sub_category value:', leadData.sub_category);
    console.log('🔍 subcategory value:', leadData.subcategory);
    console.log('🔍 All keys in leadData:', Object.keys(leadData));
    
    // Get the practice area configuration
    const practiceArea = leadData.category || 'general';
    const config = practiceAreasConfig.legal_practice_areas[practiceArea];
    
    if (!config) {
      console.error('❌ Practice area not found:', practiceArea);
      return NextResponse.json(
        { 
          success: false,
          error: 'Practice area not found',
          details: `No configuration found for practice area: ${practiceArea}`
        },
        { status: 400 }
      );
    }
    
    // Get LeadProsper configuration
    const lpConfig = config.lead_prosper_config;
    if (!lpConfig) {
      console.error('❌ LeadProsper config not found for:', practiceArea);
      return NextResponse.json(
        { 
          success: false,
          error: 'LeadProsper configuration not found',
          details: `No LeadProsper config for practice area: ${practiceArea}`
        },
        { status: 400 }
      );
    }
    
           // Extract city and state from zip code using Google API
           let city = '';
           let state = '';
           if (leadData.zip_code) {
             const locationData = await getCityStateFromZipCode(leadData.zip_code);
             if (locationData) {
               city = locationData.city;
               state = locationData.state;
               console.log(`📍 Extracted location from zip ${leadData.zip_code}: ${city}, ${state}`);
             } else {
               console.warn(`⚠️ Could not extract location from zip code: ${leadData.zip_code}`);
             }
           }
    
    // Get server-side information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const landingPageUrl = referer || 'https://attorney-directory.com';
    
           // Use real tracking IDs from frontend (or fallback to placeholders if not provided)
          const jornayaLeadId = leadData.jornaya_leadid || `jornaya_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
          const trustedFormCertUrl = leadData.trustedform_cert_url || `https://cert.trustedform.com/${Math.random().toString(36).slice(2, 11)}`;
           
          console.log('📊 Tracking IDs:', {
            jornayaLeadId: leadData.jornaya_leadid ? 
              (leadData.jornaya_leadid.startsWith('jornaya_') ? '✅ Real Jornaya ID' : '🔄 Fallback Jornaya ID') : 
              '⚠️ Placeholder Jornaya ID',
            trustedFormCertUrl: leadData.trustedform_cert_url ? 
              (leadData.trustedform_cert_url.includes('cert.trustedform.com') ? '✅ Real TrustedForm URL' : '🔄 Fallback TrustedForm URL') : 
              '⚠️ Placeholder TrustedForm URL'
          });
    
    // TCPA text
    const tcpaText = "By clicking 'Yes, Connect Me' I agree by electronic signature to be contacted by LegalHub through telephone calls, text messages, and email. I understand that my consent is not a condition of purchase.";
    
    // Prepare LeadProsper submission data
    // Generate a session ID for this direct lead submission (not from chat session)
    const sessionId = `lead-capture-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    
    const submissionData: LeadData = {
      sid: sessionId,
      lp_campaign_id: lpConfig.lp_campaign_id,
      lp_supplier_id: lpConfig.lp_supplier_id,
      lp_key: lpConfig.lp_key,
      
      // Basic contact information
      first_name: leadData.first_name || '',
      last_name: leadData.last_name || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      
      // Location information (auto-populated from zip)
      city: city,
      state: state,
      zip_code: leadData.zip_code || '',
      
      // Legal case information
      describe: leadData.describe || '',
      main_category: leadData.main_category || leadData.category || '',
      sub_category: leadData.sub_category || leadData.subcategory || 'other',
      
      // Additional fields
      has_attorney: leadData.has_attorney || '',
      bodily_injury: leadData.bodily_injury || '',
      at_fault: leadData.at_fault || '',
      date_of_incident: leadData.date_of_incident || '',
      
      // Server-side fields
      ip_address: ipAddress,
      user_agent: userAgent,
      landing_page_url: landingPageUrl,
      
      // Tracking fields
      jornaya_leadid: jornayaLeadId,
      trustedform_cert_url: trustedFormCertUrl,
      tcpa_text: tcpaText,
      
      // Additional tracking
      lp_subid1: leadData.category || '',
      lp_subid2: leadData.subcategory || '',
    };
    
    console.log('📤 Submitting to LeadProsper:', {
      campaign_id: submissionData.lp_campaign_id,
      supplier_id: submissionData.lp_supplier_id,
      practice_area: practiceArea,
      fields_count: Object.keys(submissionData).length
    });
    
    // Submit to LeadProsper
    const result = await submitLeadToLeadProsper(submissionData);
    
    if (result.success) {
      console.log('✅ Lead submitted successfully to LeadProsper:', result);
      return NextResponse.json({
        success: true,
        message: result.message || 'Lead submitted successfully',
        lead_id: result.leadId,
        practice_area: practiceArea,
        campaign_id: lpConfig.lp_campaign_id
      });
    } else {
      console.error('❌ LeadProsper submission failed:', result);
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to submit lead to LeadProsper',
          details: result.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Lead capture error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
