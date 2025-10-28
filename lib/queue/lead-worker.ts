import { getNextJob, markJobCompleted, markJobFailed, LeadJob } from '@/lib/queue/lead-queue';
import { submitLeadToLeadProsper, validateLeadForSubmission } from '@/lib/leadprosper/client';
import { updateSessionData } from '@/lib/chat/session';
import { addConversationMessage } from '@/lib/chat/session';

// Worker configuration
const WORKER_CONFIG = {
  pollInterval: 5000, // 5 seconds
  maxConcurrentJobs: 5,
  shutdownTimeout: 30000, // 30 seconds
};

// Worker state
let isRunning = false;
let activeJobs = new Set<string>();
let shutdownRequested = false;

/**
 * Start the lead processing worker
 */
export async function startLeadWorker(): Promise<void> {
  if (isRunning) {
    console.log('⚠️ Lead worker is already running');
    return;
  }
  
  isRunning = true;
  shutdownRequested = false;
  
  console.log('🚀 Starting lead processing worker...');
  
  // Set up graceful shutdown handlers
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  
  // Start polling loop
  while (!shutdownRequested) {
    try {
      await processNextJob();
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, WORKER_CONFIG.pollInterval));
    } catch (error) {
      console.error('❌ Worker loop error:', error);
      
      // Wait longer on error to avoid tight error loops
      await new Promise(resolve => setTimeout(resolve, WORKER_CONFIG.pollInterval * 2));
    }
  }
  
  console.log('🛑 Lead worker stopped');
  isRunning = false;
}

/**
 * Process the next available job
 */
async function processNextJob(): Promise<void> {
  // Check if we're at capacity
  if (activeJobs.size >= WORKER_CONFIG.maxConcurrentJobs) {
    return;
  }
  
  try {
    const job = await getNextJob();
    
    if (!job) {
      return; // No jobs available
    }
    
    // Track active job
    activeJobs.add(job.jobId);
    
    console.log(`🔄 Processing job: ${job.jobId}`, {
      category: job.category,
      campaignId: job.leadData.lp_campaign_id,
      attempts: job.attempts,
    });
    
    // Process job asynchronously
    processJobAsync(job).finally(() => {
      activeJobs.delete(job.jobId);
    });
    
  } catch (error) {
    console.error('❌ Error getting next job:', error);
  }
}

/**
 * Process a single job asynchronously
 */
async function processJobAsync(job: LeadJob): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Validate lead data
    const validation = validateLeadForSubmission(job.leadData);
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Submit to LeadProsper
    const result = await submitLeadToLeadProsper(job.leadData);
    
    const processingTime = Date.now() - startTime;
    
    if (result.success) {
      // Mark job as completed
      await markJobCompleted(job.jobId, result);
      
      // Update session with success
      await updateSessionData(job.sid, {
        lead_status: 'sent',
        vendor_response: result,
      });
      
      // Log success message
      await addConversationMessage(job.sid, 'system', 'Lead successfully submitted to attorneys', {
        jobId: job.jobId,
        leadId: result.leadId,
        processingTime,
      });
      
      console.log(`✅ Job completed successfully: ${job.jobId} (${processingTime}ms)`, {
        leadId: result.leadId,
        category: job.category,
      });
      
    } else {
      throw new Error(result.error || 'Unknown submission error');
    }
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`❌ Job failed: ${job.jobId} (${processingTime}ms)`, {
      error: errorMessage,
      category: job.category,
      attempts: job.attempts,
    });
    
    // Mark job as failed
    await markJobFailed(job.jobId, errorMessage);
    
    // Update session with failure
    await updateSessionData(job.sid, {
      lead_status: 'failed',
      vendor_response: { error: errorMessage },
    });
    
    // Log failure message
    await addConversationMessage(job.sid, 'system', 'There was an issue submitting your lead. Please try again.', {
      jobId: job.jobId,
      error: errorMessage,
      processingTime,
    });
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(): Promise<void> {
  console.log('🛑 Graceful shutdown requested...');
  shutdownRequested = true;
  
  // Wait for active jobs to complete
  const shutdownStart = Date.now();
  
  while (activeJobs.size > 0 && (Date.now() - shutdownStart) < WORKER_CONFIG.shutdownTimeout) {
    console.log(`⏳ Waiting for ${activeJobs.size} active jobs to complete...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (activeJobs.size > 0) {
    console.warn(`⚠️ Shutdown timeout reached, ${activeJobs.size} jobs still active`);
  }
  
  console.log('✅ Graceful shutdown completed');
}

/**
 * Get worker status
 */
export function getWorkerStatus(): {
  isRunning: boolean;
  activeJobs: number;
  maxConcurrentJobs: number;
  shutdownRequested: boolean;
} {
  return {
    isRunning,
    activeJobs: activeJobs.size,
    maxConcurrentJobs: WORKER_CONFIG.maxConcurrentJobs,
    shutdownRequested,
  };
}

/**
 * Stop the worker
 */
export function stopWorker(): void {
  if (!isRunning) {
    console.log('⚠️ Worker is not running');
    return;
  }
  
  console.log('🛑 Stopping worker...');
  shutdownRequested = true;
}

/**
 * Process a single job immediately (for testing)
 */
export async function processJobImmediately(jobId: string): Promise<{
  success: boolean;
  error?: string;
  processingTime?: number;
}> {
  const startTime = Date.now();
  
  try {
    // Get job from queue (this is a simplified version)
    const { getJobStatus } = await import('@/lib/queue/lead-queue');
    const job = await getJobStatus(jobId);
    
    if (!job) {
      return {
        success: false,
        error: 'Job not found',
      };
    }
    
    // Process the job
    await processJobAsync(job);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      processingTime,
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
    };
  }
}

/**
 * Health check for worker
 */
export async function workerHealthCheck(): Promise<{
  healthy: boolean;
  status: string;
  details: any;
}> {
  try {
    const status = getWorkerStatus();
    const { getQueueStats } = await import('@/lib/queue/lead-queue');
    const queueStats = await getQueueStats();
    
    const healthy = isRunning && !shutdownRequested;
    
    return {
      healthy,
      status: healthy ? 'running' : 'stopped',
      details: {
        worker: status,
        queue: queueStats,
        config: WORKER_CONFIG,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
