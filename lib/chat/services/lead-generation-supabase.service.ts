import { ChatSessionData } from '../config/schemas';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';
import { submitLeadToLeadProsper } from '@/lib/leadprosper/client';
import { ChatError } from '@/lib/errors/chat-error';
import { getPracticeAreaConfig } from '../config/practice-areas-loader';

// Define the schema for a lead to be submitted
export const LeadDataSchema = z.object({
  sid: z.string(),
  main_category: z.string().optional(),
  sub_category: z.string().optional(),
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address.").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format.").optional(), // E.164 format
  zip_code: z.string().regex(/^\d{5}(?:[-\s]\d{4})?$/, "Invalid zip code format.").optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  // LeadProsper configuration fields
  lp_campaign_id: z.number().optional(),
  lp_supplier_id: z.number().optional(),
  lp_key: z.string().optional(),
  // Case details
  describe: z.string().optional(),
  date_of_incident: z.string().optional(),
  bodily_injury: z.string().optional(),
  at_fault: z.string().optional(),
  has_attorney: z.string().optional(),
  // Server fields
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  landing_page_url: z.string().optional(),
  tcpa_text: z.string().optional(),
  // Add other collected fields dynamically
  answers: z.record(z.string(), z.any()).optional(),
  jornaya_leadid: z.string().optional(),
  trustedform_cert_url: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  transcript: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    text: z.string(),
    timestamp: z.string().datetime(),
    metadata: z.record(z.string(), z.any()).optional(),
  })).optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone number is required for lead submission.",
  path: ["email", "phone"],
}); // Remove .passthrough() - not supported in this Zod version

export type LeadData = z.infer<typeof LeadDataSchema>;

export class LeadGenerationService {
  constructor() {
    // No longer need queue initialization
  }

  /**
   * Prepares lead data from the session and submits it directly to LeadProsper.
   * @param session The current chat session data.
   * @param trackingData Optional tracking IDs (Jornaya, TrustedForm).
   * @returns A promise that resolves to the submission result.
   * @throws ChatError if lead data is invalid or submission fails.
   */
  public async generateAndSubmitLead(
    session: ChatSessionData,
    trackingData?: { jornayaLeadId?: string; trustedFormCertUrl?: string }
  ): Promise<{ success: boolean; leadId?: string; error?: string }> {
    logger.info(`Generating and submitting lead for session: ${session.sid}`);

    // Get practice area configuration for LeadProsper fields
    const practiceAreaConfig = getPracticeAreaConfig(session.main_category || 'personal_injury_law');
    
    if (!practiceAreaConfig?.lead_prosper_config) {
      throw new ChatError(`LeadProsper configuration not available for practice area: ${session.main_category}`, 'MISSING_LP_CONFIG', 400);
    }

    const lpConfig = practiceAreaConfig.lead_prosper_config;
    
    // Debug: Log the practice area config and LP config
    console.log('🔍 PRACTICE AREA CONFIG:', JSON.stringify(practiceAreaConfig, null, 2));
    console.log('🔍 LP CONFIG:', JSON.stringify(lpConfig, null, 2));

    // Build lead data with universal fields and config fields
    const rawLeadData = {
      sid: session.sid,
      main_category: session.main_category,
      sub_category: session.sub_category || session.answers.sub_category || 'other',
      first_name: session.answers.first_name,
      last_name: session.answers.last_name,
      email: session.answers.email,
      phone: session.answers.phone,
      zip_code: session.answers.zip_code,
      city: session.answers.city,
      state: session.answers.state,
      describe: session.answers.describe,
      // LeadProsper configuration fields from practice area config
      lp_campaign_id: lpConfig.lp_campaign_id,
      lp_supplier_id: lpConfig.lp_supplier_id,
      lp_key: lpConfig.lp_key,
      // Tracking fields
      jornaya_leadid: trackingData?.jornayaLeadId,
      trustedform_cert_url: trackingData?.trustedFormCertUrl,
      // Server fields
      ip_address: session.ipAddress,
      user_agent: session.userAgent,
      landing_page_url: session.landingPageUrl || '',
      tcpa_text: 'By submitting this form, you consent to be contacted by attorneys and legal service providers via phone, text, or email regarding your legal matter.',
      // Legacy fields for compatibility
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    };

    // Dynamic field mapping from chat_flow
    if (practiceAreaConfig.chat_flow) {
      practiceAreaConfig.chat_flow.forEach(flowItem => {
        const fieldName = flowItem.field;
        const fieldValue = session.answers[fieldName];
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          rawLeadData[fieldName] = fieldValue;
        }
      });
    }

    // Add any config-sourced fields from the practice area config
    const configFields = Object.entries(practiceAreaConfig.required_fields)
      .filter(([_, config]) => config.source === 'config')
      .reduce((acc, [fieldName, config]) => {
        acc[fieldName] = config.value;
        return acc;
      }, {} as Record<string, any>);

    // Merge config fields into lead data (but don't override LP fields that are already set)
    Object.assign(rawLeadData, configFields);
    
    // Ensure LP fields are always included from the lead_prosper_config
    if (lpConfig) {
      rawLeadData.lp_campaign_id = lpConfig.lp_campaign_id;
      rawLeadData.lp_supplier_id = lpConfig.lp_supplier_id;
      rawLeadData.lp_key = lpConfig.lp_key;
    }

    try {
      const validatedLeadData = LeadDataSchema.parse(rawLeadData);
      
      // Debug: Log the complete lead data before sending to LeadProsper
      console.log('🔍 LEAD DATA BEFORE LEADPROSPER SUBMISSION:', JSON.stringify(validatedLeadData, null, 2));
      
      // Submit directly to LeadProsper
      const result = await submitLeadToLeadProsper(validatedLeadData);
      
      // Debug: Log the result from LeadProsper
      console.log('🔍 LEADPROSPER SUBMISSION RESULT:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        logger.info(`Lead for session ${session.sid} successfully submitted to LeadProsper. Lead ID: ${result.leadId}`);
        
        // Update session with LeadProsper response data
        await updateSessionData(session.sid, {
          leadprosper_lead_id: result.leadId,
          leadprosper_status: result.status || 'ACCEPTED',
          leadprosper_code: result.code || 0,
          leadprosper_message: result.message || '',
          leadprosper_response: result
        });
        
        return {
          success: true,
          leadId: result.leadId,
        };
      } else {
        logger.error(`Lead submission failed for session ${session.sid}: ${result.error}`);
        throw new ChatError(`Lead submission failed: ${result.error}`, 'LEAD_SUBMISSION_ERROR', 500);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        logger.error(`Lead data validation failed for session ${session.sid}: ${errorMessages}`);
        throw new ChatError(`Invalid lead data: ${errorMessages}`, 'LEAD_VALIDATION_ERROR', 400);
      }
      if (error instanceof ChatError) {
        throw error; // Re-throw ChatError as-is
      }
      logger.error(`Error generating or submitting lead for session ${session.sid}: ${error instanceof Error ? error.message : String(error)}`);
      throw new ChatError('Failed to generate and submit lead.', 'LEAD_GENERATION_ERROR', 500);
    }
  }
}
