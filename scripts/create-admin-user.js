#!/usr/bin/env node

/**
 * Admin User Creation Script
 * 
 * This script helps create an admin user for testing the admin dashboard.
 * Run this script with: node scripts/create-admin-user.js
 * 
 * Note: This is a development script. In production, admin users should be
 * created through a secure process.
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Generate a random UUID for the admin user
    const adminId = require('crypto').randomUUID();
    
    // Create the admin profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: adminId,
        email: 'admin@attorneydirectory.com',
        full_name: 'System Administrator',
        role: 'admin',
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating admin profile:', profileError);
      return;
    }

    console.log('✅ Admin profile created successfully!');
    console.log('📧 Email: admin@attorneydirectory.com');
    console.log('👤 Name: System Administrator');
    console.log('🔑 Role: admin');
    console.log('🆔 ID:', adminId);
    
    console.log('\n📝 Next steps:');
    console.log('1. Create a Supabase auth user with email: admin@attorneydirectory.com');
    console.log('2. Update the auth user\'s ID to match the profile ID:', adminId);
    console.log('3. Or use the Supabase dashboard to link the auth user to this profile');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createAdminUser();
