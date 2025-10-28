# Lead Type Testing Guide

## Overview

This guide provides a systematic approach to test all 18 practice areas and identify field mapping issues in LeadProsper submissions.

## Files Created

1. **`test-lead-data.json`** - Sample test data for all 18 practice areas
2. **`scripts/verify-leadprosper-lead.ts`** - Single lead verification script
3. **`scripts/compare-leadprosper-fields.ts`** - Multi-lead comparison script
4. **`submission-results-template.json`** - Template for recording submission results

## Testing Workflow

### Step 1: Review Test Data

The test data generator has created sample data for all 18 practice areas:

```bash
# View the generated test data
cat test-lead-data.json
```

Each practice area includes:
- Sample answers for all chat_flow fields
- Universal fields (name, email, phone, location, etc.)
- System fields (IP, user agent, tracking IDs)

### Step 2: Submit Test Leads

For each practice area, submit a test lead through the chatbot:

1. **Open the chatbot** on your test environment
2. **Use the sample data** from `test-lead-data.json` for that practice area
3. **Complete the conversation** following the chat_flow
4. **Record the LeadProsper response** in `submission-results-template.json`

#### Example Submission Process:

For **Personal Injury Law**:
- Start conversation: "I was injured in a car accident"
- Use sample data: first_name: "John", last_name: "Smith", etc.
- Complete all chat_flow fields
- Submit lead and record the response

#### Recording Submission Results:

Update `submission-results-template.json` with the actual response:

```json
{
  "personal_injury_law": {
    "lead_id": "abc123def456",
    "status": "ACCEPTED",
    "code": 0,
    "message": "",
    "timestamp": "2024-01-28T12:00:00.000Z"
  }
}
```

### Step 3: Verify Leads in LeadProsper

Once you have submission results, run the comparison script:

```bash
# Run comparison analysis
node scripts/compare-leadprosper-fields.ts submission-results-template.json
```

This will:
- Fetch each lead from LeadProsper API
- Compare expected vs actual fields
- Generate detailed reports
- Identify missing fields per practice area

### Step 4: Analyze Results

The comparison script generates:

1. **Console output** - Quick summary
2. **`lead-comparison-report.md`** - Detailed markdown report
3. **`lead-comparison-results.json`** - Raw data for further analysis

## Practice Areas to Test

| # | Practice Area | Campaign ID | Expected Fields |
|---|---------------|-------------|-----------------|
| 1 | personal_injury_law | 29656 | 12 |
| 2 | family_law | 29660 | 9 |
| 3 | general | 29748 | 8 |
| 4 | criminal_law | 29658 | 9 |
| 5 | medical_malpractice | 29662 | 9 |
| 6 | defective_products | 29664 | 9 |
| 7 | defective_medical_devices | 29666 | 10 |
| 8 | dangerous_drugs | 29668 | 10 |
| 9 | bankruptcy | 29670 | 9 |
| 10 | employment | 29672 | 9 |
| 11 | immigration | 29674 | 9 |
| 12 | real_estate | 29676 | 9 |
| 13 | business_law | 29678 | 10 |
| 14 | intellectual_property_law | 29680 | 10 |
| 15 | wills_trusts_estates | 29682 | 10 |
| 16 | tax_law | 29684 | 10 |
| 17 | social_security_disability | 29688 | 14 ⚠️ |
| 18 | civil_rights_law | 29686 | 10 |

**Note**: SSDI already tested - missing 5 fields (doctor_treatment, currently_receiving_benefits, have_worked, out_of_work, age)

## Expected Issues to Look For

### Universal Field Issues
- Missing `landing_page_url`
- Missing tracking fields (`jornaya_leadid`, `trustedform_cert_url`)
- Missing system fields (`ip_address`, `user_agent`)

### Practice Area Specific Issues
- Fields defined in `chat_flow` not appearing in LeadProsper
- Dynamic field mapping not working
- Field values not being passed through

### Common Patterns
- All practice areas missing the same fields
- Only certain practice areas affected
- Field mapping working for some fields but not others

## Troubleshooting

### If Lead Submission Fails
1. Check the chatbot console for errors
2. Verify the LeadProsper API key is set
3. Check the campaign ID matches the practice area
4. Review the lead generation service logs

### If Fields Are Missing
1. Verify the field is in the practice area's `chat_flow`
2. Check if the chatbot collected the field during conversation
3. Review the dynamic field mapping in `lead-generation-supabase.service.ts`
4. Check the LeadProsper payload preparation in `leadprosper/client.ts`

### If Comparison Script Fails
1. Verify the LeadProsper API key is set
2. Check the lead_id is correct
3. Wait a few minutes if the lead was just submitted (API delay)
4. Check the LeadProsper API status

## Next Steps After Testing

1. **Identify Patterns**: Look for common missing fields across practice areas
2. **Debug Root Cause**: Determine why dynamic field mapping isn't working
3. **Fix Implementation**: Update the lead generation service
4. **Re-test**: Verify fixes work for all practice areas
5. **Document**: Update this guide with findings and solutions

## Quick Commands

```bash
# Generate fresh test data
node scripts/generate-test-lead-data.ts

# Verify a single lead
node scripts/verify-leadprosper-lead.ts <lead_id>

# Compare multiple leads
node scripts/compare-leadprosper-fields.ts submission-results-template.json

# List all practice areas
node scripts/list-practice-areas.js
```

## Files Reference

- **Test Data**: `test-lead-data.json`
- **Submission Template**: `submission-results-template.json`
- **Comparison Report**: `lead-comparison-report.md`
- **Raw Results**: `lead-comparison-results.json`
- **Practice Areas List**: `scripts/list-practice-areas.js`
