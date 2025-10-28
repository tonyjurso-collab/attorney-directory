import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { LeadData } from '../services/lead-generation.service';

export interface QueueJob {
  id: string;
  jobId: string;
  leadData: LeadData;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  errorMessage?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class SupabaseQueue {
  private supabase: any;

  constructor() {
    this.supabase = null; // Will be initialized when needed
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Adds a lead to the queue for processing.
   * @param leadData The lead data to process.
   * @returns The job ID.
   */
  async addLeadToQueue(leadData: LeadData): Promise<string> {
    const jobId = `lead_${Date.now()}_${uuidv4().substring(0, 8)}`;
    
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from('lead_queue')
      .insert({
        job_id: jobId,
        lead_data: leadData,
        status: 'queued',
        attempts: 0,
        max_attempts: 3,
      });

    if (error) {
      console.error(`❌ Error adding lead to queue:`, error);
      throw new Error(`Failed to add lead to queue: ${error.message}`);
    }

    console.log(`✅ Added lead to queue: ${jobId}`);
    return jobId;
  }

  /**
   * Gets the next job from the queue for processing.
   * @returns The next job, or null if no jobs available.
   */
  async getNextJob(): Promise<QueueJob | null> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('lead_queue')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('❌ Error getting next job:', error);
      return null;
    }

    return {
      id: data.id,
      jobId: data.job_id,
      leadData: data.lead_data,
      status: data.status,
      attempts: data.attempts,
      maxAttempts: data.max_attempts,
      errorMessage: data.error_message,
      processedAt: data.processed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Marks a job as processing.
   * @param jobId The job ID.
   * @returns True if successful, false otherwise.
   */
  async markJobAsProcessing(jobId: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from('lead_queue')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', jobId);

    if (error) {
      console.error(`❌ Error marking job as processing:`, error);
      return false;
    }

    return true;
  }

  /**
   * Marks a job as completed.
   * @param jobId The job ID.
   * @param processingTime The processing time in milliseconds.
   * @returns True if successful, false otherwise.
   */
  async markJobAsCompleted(jobId: string, processingTime: number): Promise<boolean> {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from('lead_queue')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', jobId);

    if (error) {
      console.error(`❌ Error marking job as completed:`, error);
      return false;
    }

    // Also record in processing status table
    await supabase
      .from('lead_processing_status')
      .insert({
        job_id: jobId,
        status: 'completed',
        processing_time: processingTime,
      });

    return true;
  }

  /**
   * Marks a job as failed and increments the attempt count.
   * @param jobId The job ID.
   * @param errorMessage The error message.
   * @param errorCode Optional error code.
   * @returns True if successful, false otherwise.
   */
  async markJobAsFailed(jobId: string, errorMessage: string, errorCode?: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    
    // First, get the current job to check attempts
    const { data: jobData, error: fetchError } = await supabase
      .from('lead_queue')
      .select('attempts, max_attempts')
      .eq('job_id', jobId)
      .single();

    if (fetchError) {
      console.error(`❌ Error fetching job for failure:`, fetchError);
      return false;
    }

    const newAttempts = jobData.attempts + 1;
    const shouldRetry = newAttempts < jobData.max_attempts;
    const newStatus = shouldRetry ? 'queued' : 'failed';

    const { error } = await supabase
      .from('lead_queue')
      .update({
        status: newStatus,
        attempts: newAttempts,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', jobId);

    if (error) {
      console.error(`❌ Error marking job as failed:`, error);
      return false;
    }

    // Record in processing status table
    await supabase
      .from('lead_processing_status')
      .insert({
        job_id: jobId,
        status: 'failed',
        error_details: { errorMessage, errorCode },
      });

    // If max attempts reached, move to failed leads table
    if (!shouldRetry) {
      const { data: leadData } = await supabase
        .from('lead_queue')
        .select('lead_data')
        .eq('job_id', jobId)
        .single();

      if (leadData) {
        await supabase
          .from('failed_leads')
          .insert({
            job_id: jobId,
            lead_data: leadData.lead_data,
            error_message: errorMessage,
            error_code: errorCode,
            retry_count: newAttempts,
          });
      }
    }

    return true;
  }

  /**
   * Gets queue statistics.
   * @returns Queue statistics.
   */
  async getQueueStats(): Promise<{
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    deadLetter: number;
    total: number;
  }> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('lead_queue')
      .select('status');

    if (error) {
      console.error('❌ Error getting queue stats:', error);
      return { queued: 0, processing: 0, completed: 0, failed: 0, deadLetter: 0, total: 0 };
    }

    const stats = data.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      acc.total += 1;
      return acc;
    }, { queued: 0, processing: 0, completed: 0, failed: 0, deadLetter: 0, total: 0 });

    return stats;
  }

  /**
   * Cleans up old completed jobs.
   * @returns The number of jobs cleaned up.
   */
  async cleanupOldJobs(): Promise<number> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
        .rpc('cleanup_old_jobs');

      if (error) {
        console.error('❌ Error cleaning up old jobs:', error);
        return 0;
      }

      console.log(`✅ Cleaned up ${data} old jobs`);
      return data;
    } catch (error) {
      console.error('❌ Error cleaning up old jobs:', error);
      return 0;
    }
  }
}
