# Chat System Architecture Documentation

## Overview

The chat system integrates with a remote PHP-based legal intake chatbot API while maintaining a modern Next.js 15 frontend. The frontend uses TypeScript, sessionStorage for client-side session management, and API proxy routes for backward compatibility. This document provides a comprehensive overview of the system architecture, components, and data flow.

## Remote API Integration

### Architecture Overview

The system uses a **proxy pattern** where Next.js API routes act as intermediaries between the frontend and the remote PHP API:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Remote API    │
│   (React/Next)  │◄──►│   (Next.js)     │◄──►│   (PHP)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                       │
        │                      ▼                       ▼
        │              ┌─────────────────┐    ┌─────────────────┐
        │              │   Adapters      │    │   MySQL DB      │
        │              │   (Transform)   │    │   (Sessions)    │
        │              └─────────────────┘    └─────────────────┘
        ▼
   ┌─────────────────┐
   │  sessionStorage │
   │  (Client-side)  │
   └─────────────────┘
```

### Key Components

**1. Session Management (`lib/chat/remote-session.ts`)**
- Client-side session ID management using `sessionStorage`
- UUID v4 generation for unique session identifiers
- Sessions persist within browser tabs and clear when tab closes
- Provides: `getOrCreateSessionId()`, `setSessionId()`, `clearSessionId()`

**2. API Adapters (`lib/chat/api-adapter.ts`)**
- Transforms between PHP API format and Next.js format
- Handles field name mapping (e.g., `answer` → `reply`)
- Maps debug information structure
- Provides response type safety

**3. Remote API Client (`lib/chat/remote-api-client.ts`)**
- Typed client for calling remote PHP endpoints
- Configurable base URL via `NEXT_PUBLIC_CHAT_API_URL`
- Automatic sessionStorage updates from responses
- Error handling and logging

**4. Proxy Routes (Updated)**
- `POST /api/chat` - Proxies to `PHP_API/ask.php`
- `POST /api/chat/submit` - Proxies to `PHP_API/submit_lead.php`
- `POST /api/chat/reset` - Proxies to `PHP_API/reset_session.php`
- All routes maintain backward compatibility with existing response format

### Session Management Flow

```
1. User opens chat
   ↓
2. Client calls getOrCreateSessionId()
   ↓
3. Check sessionStorage for existing session ID
   ↓
4. If exists, use it; if not, generate new UUID v4
   ↓
5. Store in sessionStorage
   ↓
6. Send to API with each request
   ↓
7. API returns updated session_id (if changed)
   ↓
8. Update sessionStorage with new ID
   ↓
9. On submission/reset: clear sessionStorage
```

### Response Format Mapping

**PHP API → Next.js Format**

| PHP Field | Next.js Field | Transformation |
|-----------|--------------|----------------|
| `answer` | `reply` | Direct copy |
| `session_id` | `session_id` | Direct copy |
| `debug.step` | `debug.stage` | Map to uppercase |
| `debug.category` | `debug.mainCategory` | Direct copy |
| `debug.collectedFields` | `debug.collectedFields` | Direct copy |
| `debug.next_required[0]` | `field_asked` | First item in array |
| Step state | `complete` | Infers from `debug.step` |

### Configuration

**Environment Variables:**
```bash
# Remote Chat API URL
NEXT_PUBLIC_CHAT_API_URL="https://freshlocal.co/chat/api"
```

**Benefits of this Architecture:**
1. **Backward Compatibility** - Existing frontend code continues to work
2. **Session Management** - No server-side session store needed
3. **Cross-Domain Support** - Can call remote API from any domain
4. **Testing Flexibility** - Easy to switch between local/remote APIs
5. **Type Safety** - Full TypeScript support with adapters

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Services      │
│   (React/Next)  │◄──►│   (Next.js)     │◄──►│   (TypeScript)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Data Layer    │
                       │   (Redis/DB)    │
                       └─────────────────┘
```

### Component Architecture

```
ChatWidget
├── ChatMessage
├── ChatInput
├── LeadSummary
├── ConsentModal
└── TypingIndicator

API Routes
├── /api/chat (POST) - Main chat endpoint
├── /api/chat/reset (POST) - Reset session
├── /api/chat/submit (POST) - Submit lead
└── /api/cron/process-leads (POST) - Process queued leads

Services Layer
├── CategoryDetectionService
├── FieldExtractionService
├── ConversationService
├── PersonalityService
└── LeadGenerationService

Data Layer
├── Redis Session Store
├── Transcript Logging
├── Lead Queue System
└── LeadProsper Client
```

## Data Flow

### 1. User Interaction Flow

```
User Message → ChatWidget → API Route → Services → Response
     │              │           │          │         │
     ▼              ▼           ▼          ▼         ▼
Frontend → HTTP POST → Validation → Processing → JSON Response
```

### 2. Session Management Flow

```
Request → Cookie Check → Redis Lookup → Session Data
    │           │            │             │
    ▼           ▼            ▼             ▼
Create/Get → Generate ID → Store/Retrieve → Update
```

### 3. Lead Processing Flow

```
Lead Data → Validation → Queue → Background Worker → LeadProsper
    │           │         │           │              │
    ▼           ▼         ▼           ▼              ▼
Collect → Validate → Enqueue → Process → Submit → Track
```

## Core Components

### 1. Session Management (`lib/chat/session/`)

**Redis Session Store**
- Stores session data with 7-day TTL
- Key pattern: `sess:{sessionId}`
- Includes stage, answers, metadata

**Transcript Logging**
- Append-only conversation log
- Key pattern: `conv:{sessionId}`
- Max 100 messages per session

### 2. Services Layer (`lib/chat/services/`)

**Category Detection Service**
- Layer 1: Fast regex-based detection
- Layer 2: OpenAI fallback for unclear cases
- Returns category, subcategory, confidence, method

**Field Extraction Service**
- Regex patterns for common fields (phone, email, zip)
- OpenAI parsing for complex inputs
- Validation with Zod schemas
- Auto-lookup for city/state from ZIP

**Conversation Service**
- State machine: INIT → CATEGORIZED → COLLECTING → READY_TO_SUBMIT → SUBMITTED
- Determines next missing field based on chat flow
- Manages conversation progression

**Personality Service**
- Generates personalized questions
- Context-aware responses
- Template variable replacement
- Compassionate messaging

**Lead Generation Service**
- Formats data for LeadProsper submission
- Handles field validation and formatting
- Manages compliance fields

### 3. Queue System (`lib/queue/`)

**Lead Queue**
- Redis-backed job queue
- Retry logic with exponential backoff
- Dead letter handling for failed jobs
- Job status tracking

**Background Worker**
- Processes queued leads
- Handles LeadProsper API calls
- Updates session status
- Error handling and retry logic

### 4. API Routes (`app/api/`)

**POST /api/chat**
- Main chat endpoint
- Rate limiting (5 requests per 10 seconds)
- Session management
- Service orchestration

**POST /api/chat/reset**
- Clears session and transcript
- Generates new session ID
- Returns success status

**POST /api/chat/submit**
- Validates lead data
- Enqueues for background processing
- Returns job ID for tracking

**POST /api/cron/process-leads**
- Protected cron endpoint
- Batch processes queued leads
- Returns processing summary

## Configuration System

### Practice Areas Configuration

The system loads practice area configurations from `chat/practice_areas_config.json`:

```json
{
  "legal_practice_areas": {
    "personal_injury_law": {
      "name": "Personal Injury Law",
      "subcategories": ["car accident", "truck accident", "slip and fall"],
      "chat_flow": [
        {"order": 1, "field": "first_name"},
        {"order": 2, "field": "last_name"},
        {"order": 3, "field": "phone"}
      ],
      "required_fields": {
        "first_name": {"type": "text", "required": true},
        "phone": {"type": "phone", "required": true}
      },
      "lead_prosper_config": {
        "lp_campaign_id": 12345,
        "lp_supplier_id": 67890,
        "lp_key": "your-key"
      }
    }
  }
}
```

### Environment Variables

```bash
# Core Configuration
OPENAI_API_KEY=sk-your-openai-key
REDIS_URL=redis://localhost:6379
SESSION_SECRET=your-32-char-secret

# LeadProsper Integration
LEADPROSPER_API_URL=https://api.leadprosper.com
LEADPROSPER_API_KEY=your-leadprosper-key

# Feature Flags
ENABLE_NEW_CHAT=true
NEW_CHAT_PERCENTAGE=100

# Cron Security
CRON_SECRET=your-cron-secret
```

## State Management

### Session States

1. **INIT** - Initial state, detecting category
2. **CATEGORIZED** - Category detected, collecting fields
3. **COLLECTING** - Actively collecting required fields
4. **READY_TO_SUBMIT** - All fields collected, ready for submission
5. **SUBMITTED** - Lead submitted, processing complete

### Session Data Structure

```typescript
interface ChatSessionData {
  sid: string;
  stage: 'INIT' | 'CATEGORIZED' | 'COLLECTING' | 'READY_TO_SUBMIT' | 'SUBMITTED';
  main_category?: string;
  sub_category?: string;
  answers: Record<string, any>;
  asked: string[];
  created_at: string;
  updated_at: string;
  ip: string;
  ua: string;
  lead_status?: 'queued' | 'sent' | 'failed';
  vendor_response?: any;
}
```

## Error Handling

### Error Types

- **ValidationError** - Field validation failures
- **RateLimitError** - Rate limiting violations
- **SessionError** - Session-related issues
- **VendorError** - External API failures
- **QueueError** - Job processing failures

### Error Response Format

```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "traceId": "trace_1234567890_abcdef",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "context": {
    "sessionId": "session-id",
    "field": "phone"
  }
}
```

## Performance Considerations

### Caching Strategy

- **Configuration Cache** - Practice areas config cached in memory
- **Schema Cache** - Zod schemas cached per category
- **Session Cache** - Redis with 7-day TTL
- **Transcript Cache** - Redis with 7-day TTL

### Rate Limiting

- **API Rate Limit** - 5 requests per 10 seconds per IP
- **OpenAI Rate Limit** - Handled by exponential backoff
- **LeadProsper Rate Limit** - Handled by queue system

### Monitoring

- **Structured Logging** - JSON format with trace IDs
- **Performance Metrics** - Request duration tracking
- **Error Tracking** - Categorized error logging
- **Health Checks** - Endpoint availability monitoring

## Security Considerations

### Data Protection

- **PII Redaction** - Sensitive data redacted in logs
- **Session Security** - HttpOnly, Secure, SameSite cookies
- **Input Validation** - Zod schema validation
- **Rate Limiting** - Prevents abuse

### Compliance

- **TCPA Compliance** - Consent collection and tracking
- **Data Retention** - 7-day session TTL
- **Audit Trail** - Complete conversation logging
- **Error Handling** - Secure error messages

## Deployment Strategy

### Feature Flags

- **Gradual Rollout** - Percentage-based traffic splitting
- **A/B Testing** - Compare old vs new system
- **Rollback Capability** - Quick disable mechanism
- **Monitoring** - Real-time metrics tracking

### Migration Process

1. **Backup** - Create PHP system backup
2. **Deploy** - Deploy new system with feature flag
3. **Test** - Run smoke tests and monitoring
4. **Rollout** - Gradually increase traffic percentage
5. **Monitor** - Watch metrics and error rates
6. **Complete** - Remove old system when stable

## Monitoring and Observability

### Key Metrics

- **API Latency** - p50, p95, p99 response times
- **Error Rate** - 4xx/5xx response percentages
- **Lead Success Rate** - Successful submissions percentage
- **Category Detection Accuracy** - Correct categorization rate
- **Queue Processing Time** - Job processing duration

### Health Checks

- **Redis Connection** - Database connectivity
- **OpenAI API** - External service availability
- **LeadProsper API** - Vendor service status
- **Queue Health** - Job processing status

### Alerting

- **Error Rate Thresholds** - Alert on high error rates
- **Latency Thresholds** - Alert on slow responses
- **Queue Backlog** - Alert on processing delays
- **Service Downtime** - Alert on service unavailability

## Troubleshooting Guide

### Common Issues

1. **Session Not Found**
   - Check Redis connectivity
   - Verify session TTL settings
   - Check cookie configuration

2. **Category Detection Fails**
   - Check OpenAI API key
   - Verify rate limits
   - Review detection keywords

3. **Lead Submission Fails**
   - Check LeadProsper API credentials
   - Verify queue processing
   - Review validation errors

4. **Performance Issues**
   - Check Redis performance
   - Monitor OpenAI API latency
   - Review queue backlog

### Debug Commands

```bash
# Check Redis connection
redis-cli -u $REDIS_URL ping

# Check queue status
curl http://localhost:3000/api/cron/process-leads

# Check session data
redis-cli -u $REDIS_URL hgetall sess:session-id

# Check logs
tail -f logs/application.log
```

## Future Enhancements

### Planned Features

1. **Multi-language Support** - Internationalization
2. **Advanced Analytics** - Conversation analytics
3. **A/B Testing Framework** - Built-in experimentation
4. **Machine Learning** - Improved detection accuracy
5. **Real-time Monitoring** - Live dashboard

### Scalability Improvements

1. **Horizontal Scaling** - Multiple worker instances
2. **Database Sharding** - Distributed session storage
3. **CDN Integration** - Static asset optimization
4. **Microservices** - Service decomposition
5. **Event Streaming** - Real-time event processing

## Conclusion

The new chat system provides a robust, scalable, and maintainable solution for legal intake automation. With proper monitoring, error handling, and deployment strategies, it offers significant improvements over the original PHP implementation while maintaining all existing functionality.

For questions or issues, refer to the troubleshooting guide or contact the development team.
