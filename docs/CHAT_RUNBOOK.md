# Chat System Runbook

## Overview

This runbook provides operational procedures for the new Next.js chat system, including common issues, maintenance tasks, and emergency procedures.

## System Overview

- **Application**: Next.js 15 chat system
- **Database**: Redis for sessions and queue
- **External APIs**: OpenAI, LeadProsper
- **Monitoring**: Structured logging, health checks
- **Deployment**: Feature flag controlled rollout

## Daily Operations

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/chat

# Check Redis connection
redis-cli -u $REDIS_URL ping

# Check queue status
curl http://localhost:3000/api/cron/process-leads

# Check OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

### Monitoring Commands

```bash
# View application logs
tail -f logs/application.log

# Check Redis memory usage
redis-cli -u $REDIS_URL info memory

# Monitor queue statistics
redis-cli -u $REDIS_URL llen lead_queue

# Check active sessions
redis-cli -u $REDIS_URL keys "sess:*" | wc -l
```

## Common Issues and Solutions

### 1. Session Not Found Errors

**Symptoms:**
- Users see "Session not found" errors
- Chat widget shows error messages
- High error rates in logs

**Diagnosis:**
```bash
# Check Redis connectivity
redis-cli -u $REDIS_URL ping

# Check session TTL
redis-cli -u $REDIS_URL ttl sess:session-id

# Check cookie configuration
curl -I http://localhost:3000/api/chat
```

**Solutions:**
1. **Redis Connection Issues:**
   ```bash
   # Restart Redis service
   sudo systemctl restart redis
   
   # Check Redis logs
   tail -f /var/log/redis/redis-server.log
   ```

2. **Session TTL Issues:**
   ```bash
   # Check session configuration
   redis-cli -u $REDIS_URL config get "*ttl*"
   
   # Reset session TTL
   redis-cli -u $REDIS_URL expire sess:session-id 604800
   ```

3. **Cookie Issues:**
   - Verify `SESSION_SECRET` environment variable
   - Check cookie domain and path settings
   - Ensure HTTPS in production

### 2. Category Detection Failures

**Symptoms:**
- Users get generic responses
- High "general" category assignments
- OpenAI API errors in logs

**Diagnosis:**
```bash
# Check OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check API usage
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/usage

# Review detection logs
grep "Category detection" logs/application.log
```

**Solutions:**
1. **API Key Issues:**
   ```bash
   # Verify API key format
   echo $OPENAI_API_KEY | grep "^sk-"
   
   # Test API call
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}' \
        https://api.openai.com/v1/chat/completions
   ```

2. **Rate Limiting:**
   - Check OpenAI usage dashboard
   - Implement request queuing
   - Add exponential backoff

3. **Detection Accuracy:**
   - Review practice area keywords
   - Update detection patterns
   - Monitor detection metrics

### 3. Lead Submission Failures

**Symptoms:**
- Leads stuck in queue
- High failure rates
- LeadProsper API errors

**Diagnosis:**
```bash
# Check queue status
redis-cli -u $REDIS_URL llen lead_queue
redis-cli -u $REDIS_URL hlen lead_processing
redis-cli -u $REDIS_URL hlen lead_failed

# Check LeadProsper API
curl -H "Authorization: Bearer $LEADPROSPER_API_KEY" \
     $LEADPROSPER_API_URL/health

# Review submission logs
grep "Lead submission" logs/application.log
```

**Solutions:**
1. **Queue Processing Issues:**
   ```bash
   # Restart worker process
   pm2 restart lead-worker
   
   # Process stuck jobs manually
   curl -X POST http://localhost:3000/api/cron/process-leads \
        -H "x-cron-secret: $CRON_SECRET"
   ```

2. **LeadProsper API Issues:**
   - Check API credentials
   - Verify campaign IDs
   - Review field formatting

3. **Validation Failures:**
   - Check field validation rules
   - Review data formatting
   - Update validation schemas

### 4. Performance Issues

**Symptoms:**
- Slow response times
- High memory usage
- Timeout errors

**Diagnosis:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/chat

# Check memory usage
ps aux | grep node
free -h

# Check Redis performance
redis-cli -u $REDIS_URL --latency-history
```

**Solutions:**
1. **Application Performance:**
   ```bash
   # Restart application
   pm2 restart next-app
   
   # Check for memory leaks
   node --inspect app.js
   ```

2. **Redis Performance:**
   ```bash
   # Check Redis memory usage
   redis-cli -u $REDIS_URL info memory
   
   # Clear old sessions
   redis-cli -u $REDIS_URL --scan --pattern "sess:*" | xargs redis-cli -u $REDIS_URL del
   ```

3. **Database Optimization:**
   - Review query patterns
   - Add database indexes
   - Optimize data structures

## Maintenance Tasks

### Daily Tasks

1. **Health Check**
   ```bash
   # Run health check script
   ./scripts/health-check.sh
   ```

2. **Log Review**
   ```bash
   # Check for errors
   grep -i error logs/application.log | tail -20
   
   # Check performance metrics
   grep "Performance:" logs/application.log | tail -10
   ```

3. **Queue Monitoring**
   ```bash
   # Check queue status
   ./scripts/queue-status.sh
   ```

### Weekly Tasks

1. **Session Cleanup**
   ```bash
   # Clean expired sessions
   redis-cli -u $REDIS_URL --scan --pattern "sess:*" | \
   xargs -I {} redis-cli -u $REDIS_URL ttl {} | \
   grep -v -1 | wc -l
   ```

2. **Log Rotation**
   ```bash
   # Rotate logs
   logrotate /etc/logrotate.d/chat-system
   ```

3. **Performance Review**
   ```bash
   # Generate performance report
   ./scripts/performance-report.sh
   ```

### Monthly Tasks

1. **Security Review**
   - Review access logs
   - Check for suspicious activity
   - Update security configurations

2. **Capacity Planning**
   - Review usage trends
   - Plan for scaling
   - Update resource allocations

3. **Backup Verification**
   - Test backup restoration
   - Verify data integrity
   - Update backup procedures

## Emergency Procedures

### 1. System Down

**Immediate Actions:**
1. Check system status
2. Review error logs
3. Restart services
4. Notify stakeholders

**Commands:**
```bash
# Check system status
systemctl status redis
systemctl status nginx
pm2 status

# Restart services
sudo systemctl restart redis
sudo systemctl restart nginx
pm2 restart all

# Check logs
tail -f logs/application.log
```

### 2. High Error Rate

**Immediate Actions:**
1. Check error patterns
2. Review recent changes
3. Implement rate limiting
4. Scale resources

**Commands:**
```bash
# Check error rates
grep -c "ERROR" logs/application.log

# Review recent errors
tail -100 logs/application.log | grep ERROR

# Implement emergency rate limiting
redis-cli -u $REDIS_URL set emergency_rate_limit 1
```

### 3. Data Loss

**Immediate Actions:**
1. Stop all writes
2. Assess data loss
3. Restore from backup
4. Notify stakeholders

**Commands:**
```bash
# Stop application
pm2 stop all

# Check data integrity
redis-cli -u $REDIS_URL --scan --pattern "sess:*" | wc -l

# Restore from backup
./scripts/restore-backup.sh
```

### 4. Security Breach

**Immediate Actions:**
1. Isolate system
2. Preserve evidence
3. Notify security team
4. Implement containment

**Commands:**
```bash
# Block suspicious IPs
iptables -A INPUT -s suspicious-ip -j DROP

# Preserve logs
cp logs/application.log logs/security-incident-$(date +%Y%m%d).log

# Disable affected services
pm2 stop all
```

## Rollback Procedures

### 1. Feature Flag Rollback

**Quick Rollback:**
```bash
# Disable new chat system
export ENABLE_NEW_CHAT=false

# Restart application
pm2 restart next-app
```

### 2. Complete System Rollback

**Full Rollback:**
```bash
# Stop new system
pm2 stop all

# Restore PHP system
./chat-php-backup/latest/rollback.sh

# Restart web server
sudo systemctl restart nginx
```

### 3. Database Rollback

**Data Rollback:**
```bash
# Restore Redis data
redis-cli -u $REDIS_URL flushall
redis-cli -u $REDIS_URL --pipe < backup.rdb

# Restore application data
./scripts/restore-data.sh
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Response Time**
   - API latency (p95 < 2s)
   - Page load time (< 3s)
   - Database query time (< 100ms)

2. **Error Rates**
   - 4xx errors (< 5%)
   - 5xx errors (< 1%)
   - Timeout errors (< 0.1%)

3. **Business Metrics**
   - Lead submission rate (> 95%)
   - Category detection accuracy (> 90%)
   - User satisfaction scores

### Alert Thresholds

- **Critical**: Error rate > 10%, Response time > 5s
- **Warning**: Error rate > 5%, Response time > 2s
- **Info**: Queue backlog > 100, Memory usage > 80%

### Alert Channels

- **Slack**: #chat-system-alerts
- **Email**: ops-team@company.com
- **PagerDuty**: Critical alerts only

## Troubleshooting Checklist

### Before Escalating

1. ✅ Check system health endpoints
2. ✅ Review recent error logs
3. ✅ Verify external API connectivity
4. ✅ Check resource utilization
5. ✅ Review recent deployments
6. ✅ Test basic functionality
7. ✅ Check configuration files
8. ✅ Verify environment variables

### Escalation Contacts

- **Level 1**: On-call engineer
- **Level 2**: Senior engineer
- **Level 3**: Engineering manager
- **Level 4**: CTO

### Documentation Updates

- Update this runbook after incidents
- Document new procedures
- Review and test procedures quarterly
- Keep contact information current

## Appendix

### Useful Commands

```bash
# Redis commands
redis-cli -u $REDIS_URL info
redis-cli -u $REDIS_URL monitor
redis-cli -u $REDIS_URL --scan --pattern "sess:*"

# Application commands
pm2 logs
pm2 monit
pm2 restart all

# System commands
systemctl status redis
systemctl status nginx
df -h
free -h
```

### Configuration Files

- **Environment**: `.env.local`
- **Redis**: `/etc/redis/redis.conf`
- **Nginx**: `/etc/nginx/sites-available/chat-system`
- **PM2**: `ecosystem.config.js`

### Log Locations

- **Application**: `logs/application.log`
- **Redis**: `/var/log/redis/redis-server.log`
- **Nginx**: `/var/log/nginx/access.log`
- **System**: `/var/log/syslog`
