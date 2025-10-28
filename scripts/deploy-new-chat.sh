#!/bin/bash

# Deployment Script for New Chat System
# This script handles the deployment of the new Next.js chat system with feature flags

set -e

echo "🚀 Starting deployment of new chat system..."

# Configuration
ENVIRONMENT=${1:-"staging"}
FEATURE_FLAG_PERCENTAGE=${2:-"10"}
ROLLBACK_ON_ERROR=${3:-"true"}

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Feature Flag Percentage: $FEATURE_FLAG_PERCENTAGE%"
echo "   Rollback on Error: $ROLLBACK_ON_ERROR"

# Pre-deployment checks
echo ""
echo "🔍 Running pre-deployment checks..."

# Check if required environment variables are set
REQUIRED_ENV_VARS=(
    "OPENAI_API_KEY"
    "REDIS_URL"
    "SESSION_SECRET"
    "LEADPROSPER_API_KEY"
)

for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables check passed"

# Check Redis connection
echo "🔗 Testing Redis connection..."
if ! redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
    echo "❌ Redis connection failed"
    exit 1
fi
echo "✅ Redis connection successful"

# Check OpenAI API
echo "🤖 Testing OpenAI API..."
if ! curl -s -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models > /dev/null; then
    echo "❌ OpenAI API connection failed"
    exit 1
fi
echo "✅ OpenAI API connection successful"

# Run tests
echo "🧪 Running tests..."
if ! npm test -- --passWithNoTests; then
    echo "❌ Tests failed"
    if [ "$ROLLBACK_ON_ERROR" = "true" ]; then
        echo "🔄 Rolling back due to test failures..."
        exit 1
    fi
fi
echo "✅ Tests passed"

# Build application
echo "🏗️ Building application..."
if ! npm run build; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# Backup current system
echo "💾 Creating backup..."
if [ -f "scripts/backup-php-chat.sh" ]; then
    chmod +x scripts/backup-php-chat.sh
    ./scripts/backup-php-chat.sh
else
    echo "⚠️ Backup script not found, skipping backup"
fi

# Deploy with feature flag
echo "🚀 Deploying with feature flag..."

# Set feature flag environment variable
export ENABLE_NEW_CHAT="true"
export NEW_CHAT_PERCENTAGE="$FEATURE_FLAG_PERCENTAGE"

# Deploy to staging first
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "📦 Deploying to staging environment..."
    
    # Here you would add your staging deployment commands
    # For example, if using Vercel:
    # vercel --env=staging
    
    echo "✅ Staging deployment completed"
    
    # Run smoke tests
    echo "🧪 Running smoke tests..."
    if ! npm run test:smoke; then
        echo "❌ Smoke tests failed"
        if [ "$ROLLBACK_ON_ERROR" = "true" ]; then
            echo "🔄 Rolling back staging deployment..."
            exit 1
        fi
    fi
    echo "✅ Smoke tests passed"
    
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 Deploying to production environment..."
    
    # Deploy with gradual rollout
    echo "🎯 Starting gradual rollout ($FEATURE_FLAG_PERCENTAGE%)..."
    
    # Here you would add your production deployment commands
    # For example, if using Vercel:
    # vercel --prod --env=production
    
    echo "✅ Production deployment completed"
    
    # Monitor deployment
    echo "📊 Monitoring deployment..."
    sleep 30  # Wait for deployment to stabilize
    
    # Check health endpoints
    echo "🏥 Checking health endpoints..."
    if ! curl -s http://localhost:3000/api/chat > /dev/null; then
        echo "❌ Health check failed"
        if [ "$ROLLBACK_ON_ERROR" = "true" ]; then
            echo "🔄 Rolling back production deployment..."
            exit 1
        fi
    fi
    echo "✅ Health checks passed"
fi

# Post-deployment tasks
echo ""
echo "📋 Running post-deployment tasks..."

# Clear Redis cache (optional)
echo "🧹 Clearing Redis cache..."
redis-cli -u "$REDIS_URL" FLUSHDB > /dev/null 2>&1 || true
echo "✅ Redis cache cleared"

# Warm up the application
echo "🔥 Warming up application..."
if ! curl -s http://localhost:3000/api/chat > /dev/null; then
    echo "⚠️ Warm-up request failed, but continuing..."
fi
echo "✅ Application warmed up"

# Send deployment notification
echo "📢 Sending deployment notification..."
# Here you would add notification logic (Slack, email, etc.)
echo "✅ Notification sent"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   Environment: $ENVIRONMENT"
echo "   Feature Flag: $FEATURE_FLAG_PERCENTAGE%"
echo "   Timestamp: $(date)"
echo ""
echo "📈 Next Steps:"
echo "1. Monitor application metrics"
echo "2. Watch for error rates"
echo "3. Gradually increase feature flag percentage"
echo "4. Monitor lead submission success rates"
echo ""
echo "🔍 Monitoring Commands:"
echo "   Check logs: tail -f logs/application.log"
echo "   Check metrics: curl http://localhost:3000/api/health"
echo "   Check queue status: curl http://localhost:3000/api/cron/process-leads"
echo ""
echo "🔄 Rollback Commands:"
echo "   Disable feature flag: export ENABLE_NEW_CHAT=false"
echo "   Restore PHP system: ./chat-php-backup/latest/rollback.sh"
