# Chat Repeating Questions Fix

## Issue
The chat system was repeating questions, causing user frustration when trying to use the chatbot.

## Root Causes Identified

1. **Missing Field Questions**: The `ConversationService` wasn't using the field questions from the practice areas configuration. It was using hardcoded questions instead of the properly configured questions in `practice_areas_config.json`.

2. **No Chat Flow Order**: The service wasn't respecting the `chat_flow` order defined in the configuration, causing fields to be asked in a random order rather than the intended sequence.

3. **Tracking Fields Being Asked**: Tracking/compliance fields (jornaya_leadid, trustedform_cert_url, tcpa_text) were being included in the required fields list, even though they should be auto-populated by tracking scripts.

## Fixes Applied

### 1. Fixed ConversationService to Use Proper Field Questions
**File**: `lib/chat/services/conversation.service.ts`

- Added imports for `getFieldQuestion`, `getCompassionateIntro`, and `getChatFlow`
- Updated `getFieldQuestion()` method to use field questions from the practice area config
- Added template variable replacement for `{name_prefix}`, `{first_name}`, and `{compassionate_intro}`
- Improved completion message to include the user's name

### 2. Implemented Chat Flow Order
**File**: `lib/chat/services/conversation.service.ts`

- Updated `getNextResponse()` to use the `chat_flow` array from the configuration
- Sorts fields by order before asking questions
- Ensures fields are asked in the intended sequence

### 3. Filtered Out Auto-Populated Fields
**Files**: 
- `lib/chat/services/conversation.service.ts`
- `lib/chat/utils/field-helpers.ts`
- `chat/practice_areas_config.json`

- Added filtering for fields with source: 'tracking' or 'compliance'
- Added explicit exclusion for auto-populated fields (city, state, sub_category)
- Updated practice areas config to mark tracking fields with `source: "tracking"`

## Testing Results

### Before Fix
- Questions were being asked in random order
- No consistent field progression
- Tracking fields appeared in missing fields list

### After Fix
- Questions are asked in the proper order (chat_flow)
- No repeated questions
- Proper field questions are used (e.g., "Sarah, what email address...")
- Tracking fields are excluded from user-facing questions
- Form completion message includes user's name

### Test Output Example
```
Turn 1: Ask for first_name
Turn 2: Ask for last_name  
Turn 3: Ask for email
Turn 4: Ask for has_attorney
Turn 5: Ask for zip_code
Turn 6: Complete!
```

## Additional Improvements

1. **Better Completion Message**: Now includes the user's name for personalization
2. **Template Variable Support**: Properly replaces {name_prefix}, {first_name}, and {compassionate_intro} in questions
3. **Consistent Field Progression**: Always follows the order defined in chat_flow

## Files Modified

1. `lib/chat/services/conversation.service.ts` - Main fix for field questions and chat flow order
2. `lib/chat/utils/field-helpers.ts` - Added filtering for tracking/compliance fields
3. `chat/practice_areas_config.json` - Marked tracking fields with proper source

## Testing
Run the divorce flow test to verify:
```bash
node scripts/test-divorce-flow.js
node scripts/test-divorce-repeating-issue.js
```

Both tests should show no repeated questions and proper field progression.

