import { Redis } from '@upstash/redis';

// Redis client configuration
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
});

// Lead job interface
export interface LeadJob {
  jobId: string;
  sid: string;
  leadData: Record<string, any>;
  category: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  error?: string;
  vendorResponse?: any;
}

// Queue configuration
const QUEUE_KEY = 'lead_queue';
const PROCESSING_KEY = 'lead_processing';
const COMPLETED_KEY = 'lead_completed';
const FAILED_KEY = 'lead_failed';
const DEAD_LETTER_KEY = 'lead_dead_letter';
const MAX_ATTEMPTS = 3;
const JOB_TTL = 24 * 60 * 60; // 24 hours

/**
 * Add lead job to queue
 */
export async function enqueueLeadJob(leadJob: Omit<LeadJob, 'jobId' | 'attempts' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
  const jobId = generateJobId();
  const now = new Date().toISOString();
  
  const fullJob: LeadJob = {
    ...leadJob,
    jobId,
    attempts: 0,
    createdAt: now,
    updatedAt: now,
    status: 'queued',
  };
  
  try {
    // Add to queue
    await redis.rpush(QUEUE_KEY, JSON.stringify(fullJob));
    
    // Set TTL for the job
    await redis.expire(QUEUE_KEY, JOB_TTL);
    
    console.log(`✅ Lead job enqueued: ${jobId}`, {
      category: fullJob.category,
      campaignId: fullJob.leadData.lp_campaign_id,
    });
    
    return jobId;
  } catch (error) {
    console.error('❌ Error enqueuing lead job:', error);
    throw new Error('Failed to enqueue lead job');
  }
}

/**
 * Get next job from queue
 */
export async function getNextJob(): Promise<LeadJob | null> {
  try {
    const jobData = await redis.blpop(QUEUE_KEY, 5); // Wait up to 5 seconds
    
    if (!jobData || !jobData[1]) {
      return null;
    }
    
    const job = JSON.parse(jobData[1]) as LeadJob;
    
    // Move to processing
    job.status = 'processing';
    job.updatedAt = new Date().toISOString();
    
    await redis.hset(PROCESSING_KEY, job.jobId, JSON.stringify(job));
    await redis.expire(PROCESSING_KEY, JOB_TTL);
    
    console.log(`🔄 Job moved to processing: ${job.jobId}`);
    
    return job;
  } catch (error) {
    console.error('❌ Error getting next job:', error);
    return null;
  }
}

/**
 * Mark job as completed
 */
export async function markJobCompleted(jobId: string, vendorResponse?: any): Promise<boolean> {
  try {
    // Get job from processing
    const jobData = await redis.hget(PROCESSING_KEY, jobId);
    if (!jobData) {
      console.warn(`⚠️ Job not found in processing: ${jobId}`);
      return false;
    }
    
    const job = JSON.parse(jobData as string) as LeadJob;
    job.status = 'completed';
    job.updatedAt = new Date().toISOString();
    job.vendorResponse = vendorResponse;
    
    // Move to completed
    await redis.hset(COMPLETED_KEY, jobId, JSON.stringify(job));
    await redis.expire(COMPLETED_KEY, JOB_TTL);
    
    // Remove from processing
    await redis.hdel(PROCESSING_KEY, jobId);
    
    console.log(`✅ Job completed: ${jobId}`, {
      category: job.category,
      attempts: job.attempts,
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error marking job completed:', error);
    return false;
  }
}

/**
 * Mark job as failed and handle retry logic
 */
export async function markJobFailed(jobId: string, error: string): Promise<boolean> {
  try {
    // Get job from processing
    const jobData = await redis.hget(PROCESSING_KEY, jobId);
    if (!jobData) {
      console.warn(`⚠️ Job not found in processing: ${jobId}`);
      return false;
    }
    
    const job = JSON.parse(jobData as string) as LeadJob;
    job.attempts++;
    job.updatedAt = new Date().toISOString();
    job.error = error;
    
    // Remove from processing
    await redis.hdel(PROCESSING_KEY, jobId);
    
    if (job.attempts < MAX_ATTEMPTS) {
      // Retry: put back in queue
      job.status = 'queued';
      await redis.rpush(QUEUE_KEY, JSON.stringify(job));
      
      console.log(`🔄 Job retry ${job.attempts}/${MAX_ATTEMPTS}: ${jobId}`, {
        error: error.substring(0, 100),
      });
    } else {
      // Max attempts reached: move to dead letter
      job.status = 'dead_letter';
      await redis.hset(DEAD_LETTER_KEY, jobId, JSON.stringify(job));
      await redis.expire(DEAD_LETTER_KEY, JOB_TTL);
      
      console.log(`💀 Job moved to dead letter: ${jobId}`, {
        attempts: job.attempts,
        error: error.substring(0, 100),
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error marking job failed:', error);
    return false;
  }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<LeadJob | null> {
  try {
    // Check processing first
    let jobData = await redis.hget(PROCESSING_KEY, jobId);
    if (jobData) {
      return JSON.parse(jobData as string) as LeadJob;
    }
    
    // Check completed
    jobData = await redis.hget(COMPLETED_KEY, jobId);
    if (jobData) {
      return JSON.parse(jobData as string) as LeadJob;
    }
    
    // Check failed
    jobData = await redis.hget(FAILED_KEY, jobId);
    if (jobData) {
      return JSON.parse(jobData as string) as LeadJob;
    }
    
    // Check dead letter
    jobData = await redis.hget(DEAD_LETTER_KEY, jobId);
    if (jobData) {
      return JSON.parse(jobData as string) as LeadJob;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting job status:', error);
    return null;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  deadLetter: number;
  total: number;
}> {
  try {
    const [queued, processing, completed, failed, deadLetter] = await Promise.all([
      redis.llen(QUEUE_KEY),
      redis.hlen(PROCESSING_KEY),
      redis.hlen(COMPLETED_KEY),
      redis.hlen(FAILED_KEY),
      redis.hlen(DEAD_LETTER_KEY),
    ]);
    
    return {
      queued,
      processing,
      completed,
      failed,
      deadLetter,
      total: queued + processing + completed + failed + deadLetter,
    };
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    return {
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      deadLetter: 0,
      total: 0,
    };
  }
}

/**
 * Clean up old jobs
 */
export async function cleanupOldJobs(): Promise<{
  cleaned: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let cleaned = 0;
  
  try {
    // Clean up completed jobs older than 7 days
    const completedJobs = await redis.hgetall(COMPLETED_KEY);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    for (const [jobId, jobData] of Object.entries(completedJobs)) {
      try {
        const job = JSON.parse(jobData as string) as LeadJob;
        const jobDate = new Date(job.updatedAt);
        
        if (jobDate < sevenDaysAgo) {
          await redis.hdel(COMPLETED_KEY, jobId);
          cleaned++;
        }
      } catch (error) {
        errors.push(`Failed to parse job ${jobId}: ${error}`);
      }
    }
    
    console.log(`✅ Cleaned up ${cleaned} old completed jobs`);
  } catch (error) {
    errors.push(`Failed to cleanup completed jobs: ${error}`);
  }
  
  return { cleaned, errors };
}

/**
 * Get jobs by status
 */
export async function getJobsByStatus(status: LeadJob['status'], limit: number = 100): Promise<LeadJob[]> {
  try {
    let key: string;
    
    switch (status) {
      case 'processing':
        key = PROCESSING_KEY;
        break;
      case 'completed':
        key = COMPLETED_KEY;
        break;
      case 'failed':
        key = FAILED_KEY;
        break;
      case 'dead_letter':
        key = DEAD_LETTER_KEY;
        break;
      default:
        return [];
    }
    
    const jobsData = await redis.hgetall(key);
    const jobs: LeadJob[] = [];
    
    for (const [jobId, jobData] of Object.entries(jobsData)) {
      try {
        const job = JSON.parse(jobData as string) as LeadJob;
        jobs.push(job);
      } catch (error) {
        console.warn(`⚠️ Failed to parse job ${jobId}:`, error);
      }
    }
    
    // Sort by updatedAt descending and limit
    return jobs
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('❌ Error getting jobs by status:', error);
    return [];
  }
}

/**
 * Retry failed job
 */
export async function retryJob(jobId: string): Promise<boolean> {
  try {
    // Get job from failed or dead letter
    let jobData = await redis.hget(FAILED_KEY, jobId);
    let sourceKey = FAILED_KEY;
    
    if (!jobData) {
      jobData = await redis.hget(DEAD_LETTER_KEY, jobId);
      sourceKey = DEAD_LETTER_KEY;
    }
    
    if (!jobData) {
      return false;
    }
    
    const job = JSON.parse(jobData as string) as LeadJob;
    
    // Reset for retry
    job.status = 'queued';
    job.attempts = 0;
    job.error = undefined;
    job.updatedAt = new Date().toISOString();
    
    // Remove from current location
    await redis.hdel(sourceKey, jobId);
    
    // Add back to queue
    await redis.rpush(QUEUE_KEY, JSON.stringify(job));
    
    console.log(`🔄 Job retried: ${jobId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error retrying job:', error);
    return false;
  }
}

/**
 * Generate unique job ID
 */
function generateJobId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Test queue connection
 */
export async function testQueueConnection(): Promise<boolean> {
  try {
    await redis.ping();
    console.log('✅ Queue connection successful');
    return true;
  } catch (error) {
    console.error('❌ Queue connection failed:', error);
    return false;
  }
}
