import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // This is a development-only endpoint
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 });
    }

    const supabase = await createClient();
    
    // Get the request body
    const body = await request.json();
    const { email, full_name, password } = body;

    if (!email || !full_name || !password) {
      return NextResponse.json({ 
        error: 'Email, full_name, and password are required' 
      }, { status: 400 });
    }

    // First, try to sign up a regular user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ 
        error: 'Failed to create auth user: ' + authError.message 
      }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json({ 
        error: 'No user data returned from signup' 
      }, { status: 500 });
    }

    // Create admin profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role: 'admin',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return NextResponse.json({ 
        error: 'Failed to create admin profile: ' + profileError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully! You may need to check your email to confirm the account.',
      user: {
        id: authData.user.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
      }
    });

  } catch (error) {
    console.error('Error in POST /api/admin/create-admin-simple:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
