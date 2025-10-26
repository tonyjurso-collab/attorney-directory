# Attorney Directory - Development Guide

## Project Overview

The Attorney Directory is a Next.js 15 application that connects clients with attorneys through dynamic landing pages, AI-powered chatbots, and comprehensive attorney profiles. The system includes lead generation, tracking, and submission to LeadProsper.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Search**: Algolia
- **AI**: OpenAI GPT-4, Vercel AI SDK
- **Lead Management**: LeadProsper API
- **Tracking**: Jornaya LeadID, TrustedForm
- **Maps**: Google Places API

### Key Features
1. **Dynamic Landing Pages** (`/d/[state]/[category]`)
2. **AI Chatbot** with conversation flow management
3. **Attorney Profiles** with contact forms
4. **Lead Capture** and submission to LeadProsper
5. **Search Functionality** powered by Algolia
6. **Tracking Integration** for lead attribution

## Project Structure

```
├── app/
│   ├── d/[state]/[category]/          # Dynamic landing pages
│   ├── api/
│   │   ├── chat/                      # Chat API endpoints
│   │   ├── search-attorneys/          # Attorney search
│   │   └── lead-capture/              # Lead submission
│   └── attorney/[id]/                 # Attorney profile pages
├── components/
│   ├── landing/                       # Landing page components
│   ├── chat/                         # Chatbot components
│   ├── attorney/                     # Attorney-related components
│   └── search/                      # Search components
├── lib/
│   ├── chat/                         # Chat logic and AI integration
│   ├── algolia/                      # Search configuration
│   ├── supabase/                     # Database client
│   └── utils/                        # Utility functions
└── public/
    └── practice_areas_config.json    # Practice area configuration
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Algolia account
- LeadProsper account

### Environment Variables

Create `.env.local` with:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
OPENAI_API_KEY=your_openai_api_key

# Search
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_ADMIN_API_KEY=your_algolia_admin_key
ALGOLIA_SEARCH_API_KEY=your_algolia_search_key

# Lead Management
LEADPROSPER_API_KEY=your_leadprosper_key
LEADPROSPER_SUPPLIER_ID=your_supplier_id

# Tracking
NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID=your_jornaya_campaign_id
NEXT_PUBLIC_TRUSTEDFORM_FIELD=xxTrustedFormCertUrl

# Google Places
GOOGLE_PLACES_API_KEY=your_google_places_key
```

### Installation

```bash
npm install
npm run dev
```

## Key Components

### 1. Dynamic Landing Pages

**Route**: `/d/[state]/[category]`

**Components**:
- `PracticeAreaLandingPage` - Main landing page component
- `HeroSection` - Hero section with search form
- `PracticeAreaContent` - Dynamic content sections
- `FixedChatWidget` - Fixed-position chatbot

**Example URLs**:
- `/d/nc/personal-injury`
- `/d/ca/family-law`
- `/d/tx/criminal-defense`

### 2. Chatbot System

**API Endpoints**:
- `POST /api/chat` - Main chat endpoint
- `POST /api/chat/reset` - Reset conversation
- `POST /api/chat/submit` - Submit lead

**Key Features**:
- AI-powered conversation flow
- Field extraction from user messages
- Lead capture and validation
- Tracking script integration

### 3. Attorney Search

**API Endpoint**: `POST /api/search-attorneys`

**Search Parameters**:
- `practice_area` - Legal practice area
- `state` - State abbreviation
- `category` - Practice category slug
- `subcategory` - Practice subcategory
- `city` - City name
- `zip_code` - ZIP code

### 4. Lead Capture

**API Endpoint**: `POST /api/lead-capture`

**Process**:
1. Validate required fields
2. Extract location from ZIP code
3. Generate tracking IDs
4. Submit to LeadProsper
5. Return submission result

## Configuration

### Practice Areas

The `practice_areas_config.json` file defines:
- Practice area names and descriptions
- Required fields for each area
- Chat flow configuration
- LeadProsper campaign settings

### Valid Categories

**Practice Areas**:
- `personal-injury`
- `family-law`
- `criminal-defense`
- `business-law`
- `real-estate-law`
- `estate-planning`
- `immigration-law`
- `employment-law`
- `bankruptcy-law`
- `dui-law`
- `workers-compensation`
- `medical-malpractice`
- `product-liability`
- `premises-liability`
- `wrongful-death`

**States**: All US state abbreviations (AL, AK, AZ, etc.) plus DC

## API Reference

### Chat API

```typescript
POST /api/chat
{
  "message": string
}

Response:
{
  "response": string,
  "sessionData": {
    "collectedFields": object,
    "conversationHistory": array,
    "category": string,
    "subcategory": string
  }
}
```

### Search Attorneys API

```typescript
POST /api/search-attorneys
{
  "practice_area": string,
  "state": string,
  "category"?: string,
  "subcategory"?: string,
  "city"?: string,
  "zip_code"?: string
}

Response:
{
  "attorneys": Attorney[],
  "total": number
}
```

### Lead Capture API

```typescript
POST /api/lead-capture
{
  "first_name": string,
  "last_name": string,
  "email": string,
  "phone": string,
  "zip_code": string,
  "describe": string,
  "main_category": string,
  "sub_category": string,
  "has_attorney": string,
  // ... other fields
}

Response:
{
  "success": boolean,
  "lead_id": string,
  "message": string
}
```

## Testing

### Test Pages

- `/test-chatbot` - Chatbot functionality testing
- `/test-chatbot-suite` - Comprehensive chatbot testing
- `/test-dynamic-form` - Form testing
- `/test-search` - Search functionality testing

### Test Scripts

- `test-category-fields.js` - Test practice area field requirements
- `test-required-fields.js` - Test field validation
- `test-reset.js` - Test session reset functionality

## Deployment

### Build Process

```bash
npm run build
npm start
```

### Environment Setup

1. Set up production environment variables
2. Configure Supabase production database
3. Set up Algolia production index
4. Configure LeadProsper production campaigns
5. Set up tracking script domains

## Troubleshooting

### Common Issues

1. **Chatbot not responding**: Check OpenAI API key and session management
2. **Search not working**: Verify Algolia configuration and index setup
3. **Lead submission failing**: Check LeadProsper API credentials and field mapping
4. **Tracking not working**: Verify Jornaya and TrustedForm script loading

### Debug Tools

- Use test pages for isolated testing
- Check browser console for JavaScript errors
- Monitor API responses in Network tab
- Use Supabase dashboard for database queries

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow React 19 best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add comprehensive comments for complex logic

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Test thoroughly using test pages
4. Create pull request with detailed description
5. Review and merge after approval

## Support

For development questions or issues:
1. Check this documentation first
2. Review existing test pages
3. Check API endpoints and responses
4. Consult the troubleshooting section
5. Create detailed issue reports with reproduction steps
