# Vercel Environment Variables Setup Guide

This guide lists all environment variables that need to be configured in your Vercel project dashboard. Copy the values from your `.env.local` file to the Vercel dashboard.

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New** for each variable below
4. Paste the value from your `.env.local` file
5. Select the appropriate **Environment** (Production, Preview, Development, or All)
6. Click **Save**

## Environment Variables List

### Public Variables (NEXT_PUBLIC_*)

These variables are exposed to the browser and should be set for all environments:

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://ydfmkyfbbubkragiijla.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID` | Jornaya lead tracking campaign ID | `your-jornaya-campaign-id` |
| `NEXT_PUBLIC_TRUSTEDFORM_FIELD` | TrustedForm field name for lead tracking | `xxTrustedFormCertUrl` |
| `NEXT_PUBLIC_CHAT_API_URL` | Remote chat API endpoint | `https://freshlocal.co/chat/api` |

### Private Variables (Server-Side Only)

These variables are only accessible on the server and should **NEVER** be exposed to the browser:

| Variable Name | Description | Required | Example Value |
|--------------|-------------|----------|---------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes | `sk-your-openai-api-key` |
| `OPENAI_ORG_ID` | OpenAI organization ID (optional) | No | `org-your-openai-org-id` |
| `GOOGLE_PLACES_API_KEY` | Google Places API key for geocoding | Yes | `your-google-places-api-key` |
| `LEADPROSPER_API_KEY` | LeadProsper API key for lead submission | Yes | `your-leadprosper-api-key` |
| `LEADPROSPER_CAMPAIGN_ID` | LeadProsper campaign identifier | Yes | `your-leadprosper-campaign-id` |
| `LEADPROSPER_SUB_ID` | LeadProsper sub ID | Yes | `your-leadprosper-sub-id` |
| `LEADPROSPER_SOURCE` | LeadProsper source identifier | Yes | `your-leadprosper-source` |
| `LEADPROSPER_TEST_MODE` | Enable test mode for LeadProsper | Recommended | `true` or `false` |
| `SESSION_SECRET` | Secret key for session encryption | Yes | `UFlv4pN7r3LVAwa0zxugRyJkGht1iOsD` |
| `ENABLE_NEW_CHAT` | Enable new chat system feature flag | Yes | `true` or `false` |
| `CRON_SECRET` | Secret for cron job authentication | Yes | `your-secure-cron-secret` |

## Environment-Specific Configuration

### Production Environment

Set all variables for **Production** environment. This is the live site that users will access.

### Preview Environment

Set all variables for **Preview** environment. This is used for preview deployments from pull requests.

**Recommendation**: For preview environments, you may want to use test/development API keys to avoid affecting production data.

### Development Environment

Set all variables for **Development** environment if you plan to use Vercel's development environment.

## Required vs Optional Variables

### Required Variables (Must be set for production)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `LEADPROSPER_API_KEY`
- `LEADPROSPER_CAMPAIGN_ID`
- `LEADPROSPER_SUB_ID`
- `LEADPROSPER_SOURCE`
- `SESSION_SECRET`
- `NEXT_PUBLIC_CHAT_API_URL`
- `CRON_SECRET`

### Optional Variables

- `OPENAI_ORG_ID` - Only needed if you're using OpenAI organization features
- `LEADPROSPER_TEST_MODE` - Set to `true` for testing, `false` for production
- `ENABLE_NEW_CHAT` - Feature flag, set based on your feature rollout plan
- `NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID` - Only if using Jornaya tracking
- `NEXT_PUBLIC_TRUSTEDFORM_FIELD` - Only if using TrustedForm tracking

## Security Best Practices

1. **Never commit** `.env.local` or `.env` files to git (already in `.gitignore`)
2. **Use different API keys** for production and preview environments when possible
3. **Rotate secrets** periodically, especially `SESSION_SECRET` and `CRON_SECRET`
4. **Verify values** are correct before deploying to production
5. **Use Vercel's built-in secret management** - don't hardcode secrets in code

## Verifying Environment Variables

After setting up environment variables:

1. **Trigger a new deployment** in Vercel
2. **Check build logs** to ensure no environment variable errors
3. **Test the application** to verify all features work correctly
4. **Use the health endpoint**: `https://your-domain.vercel.app/api/health`

## Troubleshooting

### Build Fails with "Environment Variable Not Found"

- Verify the variable name matches exactly (case-sensitive)
- Ensure the variable is set for the correct environment (Production/Preview/Development)
- Check that the value was saved correctly in Vercel dashboard

### Runtime Errors Related to API Keys

- Verify API keys are valid and have not expired
- Check that API keys have the correct permissions/scopes
- Ensure you're using production keys for production environment

### CORS or API Connection Issues

- Verify `NEXT_PUBLIC_CHAT_API_URL` is correct
- Check that external APIs allow requests from your Vercel domain
- Review API rate limits and quotas

## Quick Copy-Paste Checklist

When adding variables to Vercel, use this checklist:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `OPENAI_ORG_ID` (if applicable)
- [ ] `GOOGLE_PLACES_API_KEY`
- [ ] `NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID` (if applicable)
- [ ] `NEXT_PUBLIC_TRUSTEDFORM_FIELD` (if applicable)
- [ ] `LEADPROSPER_API_KEY`
- [ ] `LEADPROSPER_CAMPAIGN_ID`
- [ ] `LEADPROSPER_SUB_ID`
- [ ] `LEADPROSPER_SOURCE`
- [ ] `LEADPROSPER_TEST_MODE`
- [ ] `SESSION_SECRET`
- [ ] `ENABLE_NEW_CHAT`
- [ ] `NEXT_PUBLIC_CHAT_API_URL`
- [ ] `CRON_SECRET`

## Next Steps

After setting up environment variables, proceed to the [Vercel Deployment Guide](./DEPLOYMENT_VERCEL.md) for deployment instructions.

