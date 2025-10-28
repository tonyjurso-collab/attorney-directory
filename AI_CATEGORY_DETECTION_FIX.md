# AI Category Detection Implementation

## Issue
The chat system was not detecting legal practice area categories correctly. The previous implementation used basic keyword matching which was failing.

## Solution
Restored AI-based category detection using OpenAI's GPT-4o-mini model with keyword fallback.

## Changes Made

### 1. Updated Category Detection Service
**File**: `lib/chat/services/category-detection.service.ts`

- Removed basic keyword-only detection
- Integrated AI-based detection from `lib/chat/utils/ai-practice-area-detector.ts`
- Implemented fallback strategy:
  1. Try AI detection first (uses OpenAI)
  2. If AI fails or has low confidence, fallback to keywords
  3. Return appropriate confidence scores

### 2. Fixed Field Access Issue
**File**: `lib/chat/services/conversation.service.ts`

- Fixed incorrect field structure access
- Correctly processes `required_fields` from config (field names are object keys, not `field.name`)
- Filtered out server-provided and config fields to only ask user-facing questions

## How It Works

1. **User sends message** (e.g., "I need help with a car accident")
2. **AI Detection**:
   - Sends message to OpenAI GPT-4o-mini
   - AI analyzes against all practice areas
   - Returns main category, subcategory, and confidence
3. **Results**:
   - High confidence (90%): AI result used
   - Medium confidence (60%): AI result used
   - Low confidence or failure: Falls back to keywords
4. **Keyword Fallback**: Simple pattern matching for common terms

## Configuration Required

### OpenAI API Key
The system requires an OpenAI API key configured in `.env.local`:

```env
OPENAI_API_KEY=sk-proj-...
```

### Cost Considerations
- Uses `gpt-4o-mini` model (cost-effective)
- ~$0.15 per million input tokens
- ~$0.60 per million output tokens
- Average message: ~100-200 tokens = $0.0001-0.0002 per detection

## Testing Results

✅ **Test 1**: "I need help with a car accident"
- Detected: `personal_injury_law` / `car accident`
- Confidence: High

✅ **Test 2**: "I want a divorce"
- Detected: `family_law` / `divorce`
- Confidence: High

## Benefits

1. **Better Accuracy**: AI understands context and intent
2. **Subcategory Detection**: Automatically identifies specific types
3. **Graceful Degradation**: Falls back to keywords if AI unavailable
4. **Cost Effective**: Uses efficient model with caching potential
5. **Maintainable**: Centralized AI logic in one utility file

## Files Modified

1. `lib/chat/services/category-detection.service.ts` - Integrated AI detection
2. `lib/chat/services/conversation.service.ts` - Fixed field structure access

## Related Files

- `lib/chat/utils/ai-practice-area-detector.ts` - AI detection implementation
- `chat/practice_areas_config.json` - Practice area configurations
- `.env.local` - OpenAI API credentials
