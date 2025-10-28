# Attorney Directory - API Documentation

## Overview

The Attorney Directory API provides endpoints for attorney search, lead generation, chat functionality, and data management. All endpoints return JSON responses and follow RESTful conventions.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require API keys or session management. Include appropriate headers:

```http
Authorization: Bearer your-api-key
Content-Type: application/json
```

## Endpoints

### Chat API (New System)

#### POST /api/chat

Main chat endpoint for AI-powered conversations with enhanced field collection and validation.

**Request Body**:
```json
{
  "message": "I was in a car accident and got injured",
  "meta": {
    "location": "https://example.com/page",
    "referrer": "https://google.com"
  }
}
```

**Response**:
```json
{
  "reply": "I understand you were in a car accident and got injured. Let me ask you a few questions to connect you with the right attorney. What's your full name?",
  "next_field": "first_name",
  "prefill": {
    "first_name": "John"
  },
  "complete": false,
  "session_id": "session-123",
  "debug": {
    "collectedFields": {
      "main_category": "personal_injury_law",
      "sub_category": "car accident"
    },
    "mainCategory": "personal_injury_law",
    "subCategory": "car accident",
    "stage": "COLLECTING",
    "transcriptLength": 2
  }
}
```

**Error Response**:
```json
{
  "reply": "I'm having trouble connecting right now. Please try again in a moment, or feel free to call us directly.",
  "complete": false,
  "error": "Rate limit exceeded. Please wait a moment before sending another message.",
  "errorCode": "RATE_LIMIT_ERROR"
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request
- `429` - Rate limit exceeded
- `500` - Server error

#### POST /api/chat/reset

Reset the current chat session.

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true,
  "message": "Session reset successfully"
}
```

#### POST /api/chat/submit

Submit collected lead data for processing.

**Request Body**:
```json
{
  "sessionId": "session-123",
  "trackingData": {
    "jornayaLeadId": "jornaya-id-123",
    "trustedFormCertUrl": "https://cert.trustedform.com/abc123"
  }
}
```

**Response**:
```json
{
  "status": "queued",
  "jobId": "lead_1234567890_abcdef",
  "message": "Your information has been submitted successfully. You should hear from qualified attorneys soon."
}
```

#### POST /api/cron/process-leads

Process queued leads (protected endpoint).

**Headers**:
```
x-cron-secret: your-cron-secret
```

**Response**:
```json
{
  "success": true,
  "summary": {
    "processed": 5,
    "succeeded": 4,
    "failed": 1,
    "totalTime": 1500
  },
  "details": [
    {
      "jobId": "lead_123",
      "status": "success",
      "processingTime": 300
    }
  ]
}
```

### Legacy Chat API

#### POST /api/chat (Legacy)

Main chat endpoint for AI-powered conversations.

**Request Body**:
```json
{
  "message": "I need help with a divorce"
}
```

**Response**:
```json
{
  "response": "I understand you need help with divorce proceedings. Let me help you find a qualified family law attorney. What's your full name?",
  "sessionData": {
    "collectedFields": {},
    "conversationHistory": [
      {
        "role": "user",
        "content": "I need help with a divorce"
      },
      {
        "role": "assistant", 
        "content": "I understand you need help with divorce proceedings..."
      }
    ],
    "category": "family_law",
    "subcategory": "divorce",
    "conversationStep": "collecting_fields"
  }
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request
- `500` - Server error

#### POST /api/chat/reset (Legacy)

Reset the current chat session.

**Request Body**:
```json
{
  "sessionId": "optional-session-id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Chat session reset successfully"
}
```

#### POST /api/chat/submit (Legacy)

Submit a completed lead form.

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "zip_code": "12345",
  "describe": "I need help with a divorce",
  "main_category": "family_law",
  "sub_category": "divorce",
  "has_attorney": "no"
}
```

**Response**:
```json
{
  "success": true,
  "lead_id": "abc123",
  "message": "Lead submitted successfully"
}
```

### Search API

#### POST /api/search-attorneys

Search for attorneys based on criteria.

**Request Body**:
```json
{
  "practice_area": "Personal Injury",
  "state": "NC",
  "category": "personal-injury",
  "subcategory": "car-accident",
  "city": "Charlotte",
  "zip_code": "28201"
}
```

**Response**:
```json
{
  "attorneys": [
    {
      "id": "attorney-123",
      "full_name": "Jane Smith",
      "email": "jane@lawfirm.com",
      "phone": "(704) 555-0123",
      "bio": "Experienced personal injury attorney...",
      "years_experience": 15,
      "law_school": "Duke Law School",
      "bar_admissions": ["NC", "SC"],
      "practice_areas": ["Personal Injury", "Car Accidents"],
      "location": {
        "city": "Charlotte",
        "state": "NC",
        "zip_code": "28201"
      },
      "rating": 4.8,
      "review_count": 127,
      "profile_image_url": "https://example.com/jane-smith.jpg",
      "membership_tier": "exclusive"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10
}
```

**Query Parameters**:
- `practice_area` (required) - Legal practice area
- `state` (required) - State abbreviation
- `category` (optional) - Practice category slug
- `subcategory` (optional) - Practice subcategory
- `city` (optional) - City name
- `zip_code` (optional) - ZIP code
- `page` (optional) - Page number (default: 1)
- `per_page` (optional) - Results per page (default: 10)

### Lead Capture API

#### POST /api/lead-capture

Submit a lead to LeadProsper.

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "zip_code": "12345",
  "describe": "I was in a car accident",
  "main_category": "personal_injury_law",
  "sub_category": "car_accident",
  "has_attorney": "no",
  "bodily_injury": "yes",
  "at_fault": "no",
  "date_of_incident": "2024-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "lead_id": "RawfIZoB8JeApcHIBdiD",
  "message": "Lead submitted successfully to LeadProsper",
  "status": "SUCCESS",
  "tracking": {
    "jornaya_leadid": "jornaya_1761492271357_eu7wez80b",
    "trustedform_cert_url": "https://cert.trustedform.com/rw8h52tot"
  }
}
```

**Required Fields**:
- `first_name` - Client's first name
- `last_name` - Client's last name
- `email` - Client's email address
- `phone` - Client's phone number
- `zip_code` - Client's ZIP code
- `describe` - Description of legal issue
- `main_category` - Primary legal category
- `sub_category` - Legal subcategory
- `has_attorney` - Whether client has an attorney

**Optional Fields**:
- `bodily_injury` - Whether there was bodily injury
- `at_fault` - Whether client was at fault
- `date_of_incident` - Date of incident
- `city` - City (auto-populated from ZIP)
- `state` - State (auto-populated from ZIP)

### Utility APIs

#### GET /api/geocode-zip

Get city and state from ZIP code.

**Query Parameters**:
- `zip_code` (required) - ZIP code to geocode

**Response**:
```json
{
  "success": true,
  "city": "Charlotte",
  "state": "NC",
  "zip_code": "28201"
}
```

#### GET /api/practice-areas

Get list of available practice areas.

**Response**:
```json
{
  "practice_areas": [
    {
      "slug": "personal-injury",
      "name": "Personal Injury",
      "description": "Legal representation for injury cases",
      "subcategories": [
        "car-accident",
        "slip-and-fall",
        "medical-malpractice"
      ]
    }
  ]
}
```

## Error Handling

### Error Response Format

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_ERROR` - Authentication required
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `NOT_FOUND` - Resource not found
- `LEAD_SUBMISSION_ERROR` - Lead submission failed

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **Chat API**: 100 requests per minute per IP
- **Search API**: 1000 requests per hour per API key
- **Lead Capture**: 50 submissions per hour per IP

## Data Models

### Attorney

```typescript
interface Attorney {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  years_experience: number;
  law_school: string;
  bar_admissions: string[];
  practice_areas: string[];
  location: {
    city: string;
    state: string;
    zip_code: string;
  };
  rating: number;
  review_count: number;
  profile_image_url?: string;
  membership_tier: 'free' | 'standard' | 'exclusive';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Lead

```typescript
interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip_code: string;
  city: string;
  state: string;
  describe: string;
  main_category: string;
  sub_category: string;
  has_attorney: string;
  bodily_injury?: string;
  at_fault?: string;
  date_of_incident?: string;
  jornaya_leadid?: string;
  trustedform_cert_url?: string;
  ip_address: string;
  user_agent: string;
  landing_page_url: string;
  created_at: string;
}
```

### Chat Session (New System)

```typescript
interface ChatSessionData {
  sid: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  main_category?: string;
  sub_category?: string;
  stage: 'COLLECTING' | 'READY_TO_SUBMIT' | 'SUBMITTED' | 'FAILED_SUBMISSION';
  answers: Record<string, any>;
  asked: string[];
  transcript: Array<{
    role: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  leadId?: string;
  leadStatus?: string;
}
```

### Chat Session (Legacy)

```typescript
interface ChatSession {
  sessionId: string;
  collectedFields: Record<string, any>;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  category?: string;
  subcategory?: string;
  conversationStep?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Testing

### Test Endpoints

- `POST /api/test-chatbot-suite` - Comprehensive chatbot testing
- `GET /api/test-connect` - Connection testing
- `POST /api/test-save` - Data persistence testing

### Test Data

Use the test pages for development:
- `/test-chatbot` - Chatbot functionality
- `/test-search` - Search functionality
- `/test-dynamic-form` - Form testing

## SDK Examples

### JavaScript/TypeScript

```typescript
// Search attorneys
const searchAttorneys = async (criteria: SearchCriteria) => {
  const response = await fetch('/api/search-attorneys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(criteria),
  });
  return response.json();
};

// Submit lead
const submitLead = async (leadData: LeadData) => {
  const response = await fetch('/api/lead-capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });
  return response.json();
};
```

### cURL Examples

```bash
# Search attorneys
curl -X POST http://localhost:3000/api/search-attorneys \
  -H "Content-Type: application/json" \
  -d '{
    "practice_area": "Personal Injury",
    "state": "NC",
    "category": "personal-injury"
  }'

# Submit lead
curl -X POST http://localhost:3000/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "zip_code": "12345",
    "describe": "I need legal help",
    "main_category": "personal_injury_law",
    "sub_category": "car_accident",
    "has_attorney": "no"
  }'
```

## Migration Notes

The new chat system is a complete rewrite of the original PHP implementation with the following improvements:

- **Modern Architecture**: Next.js 15 with TypeScript
- **Better Performance**: Redis caching and optimized queries
- **Enhanced Reliability**: Comprehensive error handling and retry logic
- **Improved Monitoring**: Structured logging and health checks
- **Scalable Design**: Queue-based lead processing
- **Better UX**: Real-time validation and error messages

The system maintains backward compatibility with existing integrations while providing enhanced functionality and reliability.

## Support

For API support:
1. Check this documentation
2. Review error responses
3. Test with provided test endpoints
4. Contact development team with specific error details
