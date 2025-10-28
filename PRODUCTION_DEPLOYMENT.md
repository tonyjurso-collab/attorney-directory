# Production Deployment Checklist

## Deployment Steps

### 1. Environment Variables
Add to your production environment (Vercel/Netlify/etc):
```env
NEXT_PUBLIC_CHAT_API_URL="https://freshlocal.co/chat/api"
```

### 2. Files Included in Deployment
All modified files are in the codebase:
- ✅ `lib/chat/remote-session.ts` - New
- ✅ `lib/chat/api-adapter.ts` - New
- ✅ `lib/chat/remote-api-client.ts` - New
- ✅ `app/api/chat/*.ts` - Updated (proxy routes)
- ✅ `components/chat/ChatWidget.tsx` - Updated
- ✅ `app/test-chatbot/page.tsx` - Updated

### 3. CORS Configuration
Ensure your PHP API (freshlocal.co) allows your production domain:
```php
define('CORS_ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-production-domain.com',
]);
```

### 4. Testing on Production
1. Visit your live site
2. Open the floating chat widget
3. Send a test message
4. Check browser DevTools → Application → Session Storage
5. Verify `legalhub_session_id` is created
6. Send a follow-up message
7. Verify the same session ID is reused

### 5. Monitoring
Check for:
- Session IDs being reused (not regenerated)
- One database entry per conversation
- Proper response format from API
- Error handling working correctly

## Rollback Plan
If issues occur:
- Previous implementation is in git history
- Can revert to commit before integration
- Local version still works for testing

