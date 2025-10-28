# Session ID Fix - Preventing Regeneration on Each Request

## Problem

The session ID was being regenerated on each request, creating multiple database entries for the same conversation. This is caused by:

1. **Server-side generation**: The proxy route was generating new UUIDs when no session_id was provided
2. **Session continuity**: The client's sessionStorage should be the single source of truth for session IDs

## Solution

### Changes Made

1. **`lib/chat/remote-api-client.ts`**:
   - Removed server-side UUID generation
   - Now passes `undefined` if no session_id is provided
   - The remote PHP API creates the session ID on first request
   - Only the client manages session IDs via sessionStorage

2. **`app/api/chat/route.ts`**:
   - Updated comments to clarify session ID handling
   - Passes through client's session_id (or undefined for first message)
   - Never generates session IDs on the server

## How It Works Now

### First Message
1. Client: No session_id in sessionStorage
2. Client sends: `{ message: "test", session_id: null }` 
3. Proxy: Passes `undefined` to remote API
4. Remote API: Creates new session, returns `session_id`
5. Client: Stores session_id in sessionStorage
6. Database: ONE entry created ✅

### Subsequent Messages
1. Client: Has session_id in sessionStorage
2. Client sends: `{ message: "test", session_id: "abc-123..." }`
3. Proxy: Passes session_id to remote API
4. Remote API: Updates existing session, returns same `session_id`
5. Client: Updates sessionStorage (same ID)
6. Database: Same entry updated ✅

## Testing

Check your database - you should see:
- **One session per conversation** (not one per message)
- **Same session_id reused** throughout the conversation
- **Last updated timestamp** changing with each message

### Browser Verification

Open DevTools → Application → Session Storage:
- Look for `legalhub_session_id`
- Should persist across messages
- Should only change when:
  - New conversation started (reset button)
  - Lead submitted (session cleared)
  - Tab closed and reopened (new session)

## Code Flow

```
Browser (ChatWidget)
  ↓ getOrCreateSessionId() from sessionStorage
  ↓ sendChatMessage() includes session_id
  ↓
Next.js Proxy (/api/chat)
  ↓ forwards session_id to remote API
  ↓ never generates new IDs
  ↓
Remote PHP API
  ↓ creates session if no ID
  ↓ OR updates existing session if ID provided
  ↓ returns session_id in response
  ↓
Browser (ChatWidget) 
  ↓ setSessionId() updates sessionStorage
  ↓ same session_id used for next message
```

## Key Principles

1. **Client owns session IDs** - Only generated in browser sessionStorage
2. **Server never generates** - Proxy just passes through
3. **Remote API manages** - Creates/updates sessions in database
4. **Session persistence** - sessionStorage survives page refreshes
5. **Session isolation** - Each tab has its own session ID

## If Problem Persists

If you still see multiple sessions:

1. **Check browser sessionStorage** - Is `legalhub_session_id` being set?
2. **Check request payload** - Is `session_id` being sent with each request?
3. **Check server logs** - Look for "hasSessionId: false" in logs
4. **Clear browser data** - Clear sessionStorage and reload
5. **Test in incognito** - Start fresh to isolate issues

## Expected Database Behavior

**Good (Fixed):**
```
Session 1: messages 1, 2, 3, 4 → 1 database entry
Session 2: messages 1, 2, 3    → 1 database entry
```

**Bad (Before fix):**
```
Session 1: message 1 → database entry 1
Session 2: message 2 → database entry 2  ❌
Session 3: message 3 → database entry 3  ❌
```

