import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { loadPracticeAreasConfig } from '@/lib/chat/config/practice-areas-loader';

export async function GET(request: NextRequest) {
  const health: {
    status: string;
    timestamp: string;
    version: string;
    services: {
      supabase: { status: string; latency?: number; error?: string };
      openai: { status: string; latency?: number; error?: string };
      config: { status: string; practiceAreas?: number; error?: string };
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      supabase: { status: 'unknown', latency: 0 },
      openai: { status: 'unknown', latency: 0 },
      config: { status: 'unknown', practiceAreas: 0 },
    },
  };

  // Test Supabase
  try {
    const start = Date.now();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    health.services.supabase = {
      status: 'ok',
      latency: Date.now() - start,
    };
  } catch (error) {
    health.services.supabase = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  // Test OpenAI
  try {
    const start = Date.now();
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
    
    await openai.models.list();
    health.services.openai = {
      status: 'ok',
      latency: Date.now() - start,
    };
  } catch (error) {
    health.services.openai = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  // Test Configuration
  try {
    const config = loadPracticeAreasConfig();
    health.services.config = {
      status: 'ok',
      practiceAreas: config.practiceAreas.length,
    };
  } catch (error) {
    health.services.config = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
