import { NextRequest, NextResponse } from 'next/server';
import { processJobImmediately, workerHealthCheck } from '@/lib/queue/lead-worker';
import { getNextJob, markJobCompleted, markJobFailed, getQueueStats } from '@/lib/queue/lead-queue';
import { submitLeadToLeadProsper, validateLeadForSubmission } from '@/lib/leadprosper/client';
import { updateSessionData, addConversationMessage } from '@/lib/chat/session';

// Cron configuration
const CRON_CONFIG = {
  maxJobsPerRun: 10,
  batchSize: 5,
  timeout: 30000, // 30 seconds per job
};

/**
 * POST /api/cron/process-leads - Process queued leads
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret || cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🔄 Starting cron lead processing...');
    
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
      jobs: [] as Array<{
        jobId: string;
        status: 'success' | 'failed';
        processingTime: number;
        error?: string;
      }>,
    };
    
    // Process jobs in batches
    for (let batch = 0; batch < Math.ceil(CRON_CONFIG.maxJobsPerRun / CRON_CONFIG.batchSize); batch++) {
      const batchResults = await processBatch(CRON_CONFIG.batchSize);
      
      results.processed += batchResults.processed;
      results.succeeded += batchResults.succeeded;
      results.failed += batchResults.failed;
      results.errors.push(...batchResults.errors);
      results.jobs.push(...batchResults.jobs);
      
      // If we processed fewer jobs than batch size, we're done
      if (batchResults.processed < CRON_CONFIG.batchSize) {
        break;
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Cron processing completed (${totalTime}ms):`, {
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      errors: results.errors.length,
    });
    
    return NextResponse.json({
      success: true,
      summary: {
        processed: results.processed,
        succeeded: results.succeeded,
        failed: results.failed,
        totalTime,
      },
      details: results.jobs,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
    
  } catch (error) {
    console.error('❌ Cron processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Cron processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Process a batch of jobs
 */
async function processBatch(batchSize: number): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
  jobs: Array<{
    jobId: string;
    status: 'success' | 'failed';
    processingTime: number;
    error?: string;
  }>;
}> {
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as string[],
    jobs: [] as Array<{
      jobId: string;
      status: 'success' | 'failed';
      processingTime: number;
      error?: string;
    }>,
  };
  
  // Process jobs in parallel (up to batch size)
  const jobPromises: Promise<void>[] = [];
  
  for (let i = 0; i < batchSize; i++) {
    jobPromises.push(processNextJobInBatch(results));
  }
  
  // Wait for all jobs to complete
  await Promise.allSettled(jobPromises);
  
  return results;
}

/**
 * Process next job in batch
 */
async function processNextJobInBatch(results: {
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
  jobs: Array<{
    jobId: string;
    status: 'success' | 'failed';
    processingTime: number;
    error?: string;
  }>;
}): Promise<void> {
  const jobStartTime = Date.now();
  
  try {
    const job = await getNextJob();
    
    if (!job) {
      return; // No jobs available
    }
    
    results.processed++;
    
    console.log(`🔄 Processing job: ${job.jobId}`, {
      category: job.category,
      campaignId: job.leadData.lp_campaign_id,
    });
    
    // Validate lead data
    const validation = validateLeadForSubmission(job.leadData);
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Submit to LeadProsper with timeout
    const submissionPromise = submitLeadToLeadProsper(job.leadData);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Job timeout')), CRON_CONFIG.timeout);
    });
    
    const result = await Promise.race([submissionPromise, timeoutPromise]);
    
    const processingTime = Date.now() - jobStartTime;
    
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
      
      results.succeeded++;
      results.jobs.push({
        jobId: job.jobId,
        status: 'success',
        processingTime,
      });
      
      console.log(`✅ Job completed: ${job.jobId} (${processingTime}ms)`);
      
    } else {
      throw new Error(result.error || 'Unknown submission error');
    }
    
  } catch (error) {
    const processingTime = Date.now() - jobStartTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to get job ID for error reporting
    let jobId = 'unknown';
    try {
      const job = await getNextJob();
      if (job) {
        jobId = job.jobId;
        await markJobFailed(job.jobId, errorMessage);
        
        // Update session with failure
        await updateSessionData(job.sid, {
          lead_status: 'failed',
          vendor_response: { error: errorMessage },
        });
      }
    } catch (markError) {
      console.error('❌ Error marking job failed:', markError);
    }
    
    results.failed++;
    results.errors.push(`${jobId}: ${errorMessage}`);
    results.jobs.push({
      jobId,
      status: 'failed',
      processingTime,
      error: errorMessage,
    });
    
    console.error(`❌ Job failed: ${jobId} (${processingTime}ms)`, {
      error: errorMessage,
    });
  }
}

/**
 * GET /api/cron/process-leads - Health check and status
 */
export async function GET(request: NextRequest) {
  try {
    // Get queue statistics
    const queueStats = await getQueueStats();
    
    // Get worker health
    const workerHealth = await workerHealthCheck();
    
    // Get system status
    const systemStatus = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      queue: queueStats,
      worker: workerHealth,
      config: CRON_CONFIG,
    };
    
    return NextResponse.json(systemStatus);
    
  } catch (error) {
    console.error('❌ Cron health check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Manual job processing endpoint (for testing)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 Manual processing requested for job: ${jobId}`);
    
    const result = await processJobImmediately(jobId);
    
    return NextResponse.json({
      success: result.success,
      jobId,
      processingTime: result.processingTime,
      error: result.error,
    });
    
  } catch (error) {
    console.error('❌ Manual job processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Manual processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
