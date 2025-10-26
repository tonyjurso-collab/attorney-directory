# Attorney Directory - Deployment Guide

## Overview

This guide covers deploying the Attorney Directory application to production environments, including environment setup, database configuration, and monitoring.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Access to production servers
- Required API keys and credentials

## Environment Setup

### 1. Production Environment Variables

Create `.env.production` with the following variables:

```env
# Database (Supabase Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# AI Services
OPENAI_API_KEY=your-production-openai-key

# Search (Algolia Production)
NEXT_PUBLIC_ALGOLIA_APP_ID=your-production-algolia-app-id
ALGOLIA_ADMIN_API_KEY=your-production-algolia-admin-key
ALGOLIA_SEARCH_API_KEY=your-production-algolia-search-key

# Lead Management (LeadProsper Production)
LEADPROSPER_API_KEY=your-production-leadprosper-key
LEADPROSPER_SUPPLIER_ID=your-production-supplier-id

# Tracking (Production Domains)
NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID=your-production-jornaya-campaign-id
NEXT_PUBLIC_TRUSTEDFORM_FIELD=xxTrustedFormCertUrl

# Google Services
GOOGLE_PLACES_API_KEY=your-production-google-places-key

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Attorney Directory

# Security
IRON_SESSION_PASSWORD=your-production-session-password
IRON_SESSION_COOKIE_NAME=attorney-directory-session
```

### 2. Database Setup

#### Supabase Production Database

1. **Create Production Project**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project for production
   - Note the URL and API keys

2. **Run Database Migrations**:
   ```bash
   # Connect to production database
   psql "postgresql://postgres:[password]@[host]:5432/postgres"
   
   # Run migration scripts
   \i lib/database/create-google-reviews-table.sql
   \i lib/database/add-google-places-fields.sql
   \i lib/database/add-landing-page-fields.sql
   ```

3. **Seed Initial Data**:
   ```bash
   # Run data seeding scripts
   npm run seed:production
   ```

### 3. Search Index Setup

#### Algolia Production Index

1. **Create Production Index**:
   ```bash
   # Use Algolia CLI or dashboard
   algolia index create attorney-directory-prod
   ```

2. **Configure Index Settings**:
   ```json
   {
     "searchableAttributes": [
       "full_name",
       "practice_areas",
       "location.city",
       "location.state",
       "bio"
     ],
     "attributesForFaceting": [
       "practice_areas",
       "location.state",
       "location.city",
       "membership_tier"
     ],
     "ranking": [
       "typo",
       "geo",
       "words",
       "filters",
       "proximity",
       "attribute",
       "exact",
       "custom"
     ]
   }
   ```

3. **Sync Attorney Data**:
   ```bash
   # Run sync script
   npm run sync:algolia:production
   ```

## Build and Deployment

### 1. Build Process

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Verify build
npm run start
```

### 2. Deployment Options

#### Option A: Vercel (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your Git repository
   - Configure build settings

2. **Environment Variables**:
   - Add all production environment variables
   - Set `NODE_ENV=production`

3. **Deploy**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

#### Option B: Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   # Install dependencies based on the preferred package manager
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   # Build the application
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   
   # Set the correct permission for prerender cache
   RUN mkdir .next
   RUN chown nextjs:nodejs .next
   
   # Automatically leverage output traces to reduce image size
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run**:
   ```bash
   # Build Docker image
   docker build -t attorney-directory .
   
   # Run container
   docker run -p 3000:3000 --env-file .env.production attorney-directory
   ```

#### Option C: Traditional Server

1. **Server Setup**:
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone https://github.com/your-org/attorney-directory.git
   cd attorney-directory
   
   # Install dependencies
   npm ci
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "attorney-directory" -- start
   pm2 save
   pm2 startup
   ```

## Post-Deployment Configuration

### 1. Domain and SSL

```bash
# Configure domain (example with nginx)
sudo nano /etc/nginx/sites-available/attorney-directory

# Add SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 2. Monitoring Setup

#### Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const supabase = createClient(/* ... */);
    await supabase.from('attorneys').select('id').limit(1);
    
    // Check Algolia connection
    const algolia = algoliasearch(/* ... */);
    await algolia.search('test');
    
    return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
```

#### Logging

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/attorney-directory

# Monitor logs
pm2 logs attorney-directory
```

### 3. Performance Optimization

#### Caching

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // Enable caching
  cacheMaxMemorySize: 0,
  compress: true,
};
```

#### CDN Setup

Configure CDN for static assets:
- Images: `/public/images/`
- CSS/JS: `.next/static/`
- API responses: Cache appropriate endpoints

## Security Configuration

### 1. Environment Security

```bash
# Secure environment files
chmod 600 .env.production
chown root:root .env.production
```

### 2. API Security

```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. CORS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

## Monitoring and Maintenance

### 1. Performance Monitoring

```bash
# Install monitoring tools
npm install -g clinic

# Run performance analysis
clinic doctor -- node server.js
```

### 2. Error Tracking

```typescript
// Add error tracking (Sentry example)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Backup Strategy

```bash
# Database backup
pg_dump "postgresql://user:pass@host:5432/db" > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
# backup.sh
pg_dump $DATABASE_URL > /backups/backup_$(date +%Y%m%d_%H%M%S).sql
find /backups -name "backup_*.sql" -mtime +7 -delete
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm ci
   npm run build
   ```

2. **Database Connection Issues**:
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. **Memory Issues**:
   ```bash
   # Increase Node.js memory
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

### Debug Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs attorney-directory

# Restart application
pm2 restart attorney-directory

# Monitor resources
pm2 monit
```

## Rollback Procedures

### 1. Quick Rollback

```bash
# Revert to previous version
git checkout previous-commit-hash
npm ci
npm run build
pm2 restart attorney-directory
```

### 2. Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup_20240101.sql
```

### 3. Configuration Rollback

```bash
# Restore previous environment
cp .env.production.backup .env.production
pm2 restart attorney-directory
```

## Maintenance Schedule

### Daily
- Monitor application health
- Check error logs
- Verify backup completion

### Weekly
- Review performance metrics
- Update dependencies
- Security scan

### Monthly
- Full system backup
- Performance optimization review
- Security audit

## Support Contacts

- **Development Team**: dev-team@company.com
- **DevOps Team**: devops@company.com
- **Emergency Contact**: +1-555-0123

For deployment issues, contact the development team with:
- Error logs
- Environment details
- Steps to reproduce
- Expected vs actual behavior
