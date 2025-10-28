# Chat System Setup Guide

## Step 1: Environment Configuration

### 1.1 Copy Environment Template
```bash
cp env.local.template .env.local
```

### 1.2 Configure Environment Variables

Edit `.env.local` and update the following values:

#### Required Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (already configured)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key (already configured)
- `OPENAI_API_KEY` - Your OpenAI API key (starts with `sk-`)
- `LEADPROSPER_API_KEY` - Your LeadProsper API key
- `LEADPROSPER_CAMPAIGN_ID` - Your LeadProsper campaign ID
- `LEADPROSPER_SUB_ID` - Your LeadProsper sub ID
- `LEADPROSPER_SOURCE` - Your LeadProsper source
- `CRON_SECRET` - A secure secret for cron endpoints

#### Optional Variables:
- `OPENAI_ORG_ID` - Your OpenAI organization ID
- `NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID` - Jornaya campaign ID
- `NEXT_PUBLIC_TRUSTEDFORM_FIELD` - TrustedForm field name
- `LEADPROSPER_TEST_MODE` - Set to "true" for testing

### 1.3 Database Setup

The system uses your existing Supabase database. You need to add the chat system tables:

1. Go to your Supabase SQL Editor
2. Run the SQL from `lib/database/chat-schema.sql`
3. This will create the necessary tables for chat sessions and lead queue

### 1.4 OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Copy the key to your `.env.local`

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Test Infrastructure

### 3.1 Run Infrastructure Tests
```bash
npm run test:infrastructure
```

This will test:
- Supabase connection
- OpenAI API connection
- Configuration loading
- Session management

### 3.2 Start Development Server
```bash
npm run dev
```

### 3.3 Test Health Endpoint
```bash
npm run health
```

Or visit: http://localhost:3000/api/health

## Step 4: Test Chat System

### 4.1 Basic Chat Test
Visit: http://localhost:3000/api/chat

Send a POST request with:
```json
{
  "message": "I was in a car accident and got injured"
}
```

### 4.2 Test Session Reset
Visit: http://localhost:3000/api/chat/reset

Send a POST request with:
```json
{}
```

## Step 5: Frontend Integration

### 5.1 Update ChatWidget
The ChatWidget component needs to be updated to use the new API contract. The new system provides:
- `reply` - The AI response
- `next_field` - The next field to collect
- `prefill` - Pre-filled values
- `complete` - Whether the form is complete
- `session_id` - Session identifier
- `debug` - Debug information

### 5.2 Test Frontend
1. Start the development server
2. Navigate to a page with the ChatWidget
3. Test the conversation flow
4. Verify field collection and validation

## Troubleshooting

### Common Issues:

1. **Supabase Connection Failed**
   - Check your Supabase credentials
   - Verify the database tables exist
   - Check network connectivity

2. **OpenAI API Error**
   - Verify your API key is correct
   - Check your OpenAI account has credits
   - Verify the organization ID if using one

3. **Configuration Loading Failed**
   - Ensure `config/practice_areas_config.json` exists
   - Check the JSON syntax is valid
   - Verify file permissions

4. **Session Management Issues**
   - Check Supabase connection
   - Verify chat_sessions table exists
   - Check RLS policies

### Debug Commands:

```bash
# Test Supabase directly
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/chat_sessions?select=count"

# Test OpenAI directly
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check configuration
node -e "console.log(require('./config/practice_areas_config.json'))"
```

## Next Steps

Once the infrastructure is working:

1. **Test the complete flow** - From initial message to lead submission
2. **Update the frontend** - Integrate the new API contract
3. **Deploy to staging** - Test in a production-like environment
4. **Set up monitoring** - Configure alerts and logging
5. **Plan migration** - Prepare for production rollout

## Support

If you encounter issues:
1. Check the logs in the browser console
2. Review the server logs
3. Test individual components using the health endpoint
4. Verify all environment variables are set correctly
