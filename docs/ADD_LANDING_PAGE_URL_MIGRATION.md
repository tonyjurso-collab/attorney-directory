# Add Landing Page URL Migration

## Overview
This migration adds the `landing_page_url` column to the `chat_sessions` table to track where chat sessions were initiated from.

## What Changed

### Database Schema
- Added `landing_page_url TEXT` column to `chat_sessions` table
- Added an index for faster queries on landing page URLs

### Code Changes
- Updated `lib/chat/config/schemas.ts` - Already had `landingPageUrl` field
- Updated `lib/chat/session/supabase-store.ts` - Now saves and retrieves landing page URL
- Updated `lib/database/chat-schema.sql` - Added column to base schema

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Paste the contents of `lib/database/migrations/add-landing-page-url.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed and configured
supabase db push
```

### Option 3: Manual SQL Execution

Run the following SQL commands in your Supabase SQL editor:

```sql
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS landing_page_url TEXT;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_landing_page_url 
ON public.chat_sessions (landing_page_url);

COMMENT ON COLUMN public.chat_sessions.landing_page_url 
IS 'URL of the landing page where the chat was initiated';
```

## Verification

After applying the migration, verify that the column was added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_sessions' 
  AND column_name = 'landing_page_url';
```

You should see:
```
column_name          | data_type | is_nullable
landing_page_url     | text      | YES
```

## How It Works

The landing page URL is automatically captured from the HTTP `Referer` header when a new chat session is created. This happens in `lib/chat/session.ts`:

```typescript
// Get landing page URL from referer header
landingPageUrl = request.headers.get('referer') || undefined;
```

The URL is then stored in the database when the session is created and can be updated throughout the session lifecycle.

## Benefits

1. **Analytics**: Track which landing pages generate the most chat sessions
2. **Attribution**: Understand which marketing campaigns drive chat engagement
3. **Optimization**: Identify high-performing pages for chat placement
4. **Reporting**: Build reports on chat volume by landing page

## Data Privacy

Note: The landing page URL may contain sensitive information (UTM parameters, session IDs, etc.). Ensure you comply with your privacy policy and data retention requirements when storing this data.
