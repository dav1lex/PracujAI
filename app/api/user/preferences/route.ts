import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { withCors } from '@/utils/cors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = withCors(async function POST(request: NextRequest) {
  try {
    const preferences = await request.json();

    // Validate preferences structure
    const validKeys = ['emailNotifications', 'lowCreditAlerts', 'purchaseConfirmations', 'systemUpdates'];
    const hasValidKeys = Object.keys(preferences).every(key => validKeys.includes(key));
    
    if (!hasValidKeys) {
      return NextResponse.json({ error: 'Invalid preferences format' }, { status: 400 });
    }

    // Get the current user from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user preferences already exist
    const { data: existingPrefs, error: fetchError } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching preferences:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    const preferencesData = {
      user_id: user.id,
      email_notifications: preferences.emailNotifications,
      low_credit_alerts: preferences.lowCreditAlerts,
      purchase_confirmations: preferences.purchaseConfirmations,
      system_updates: preferences.systemUpdates,
      updated_at: new Date().toISOString()
    };

    if (existingPrefs) {
      // Update existing preferences
      const { error: updateError } = await supabaseAdmin
        .from('user_preferences')
        .update(preferencesData)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating preferences:', updateError);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
      }
    } else {
      // Create new preferences
      const { error: insertError } = await supabaseAdmin
        .from('user_preferences')
        .insert({
          ...preferencesData,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating preferences:', insertError);
        return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error in preferences update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const GET = withCors(async function GET(request: NextRequest) {
  try {
    // Get the current user from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user preferences
    const { data: preferences, error: fetchError } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      emailNotifications: true,
      lowCreditAlerts: true,
      purchaseConfirmations: true,
      systemUpdates: false
    };

    if (!preferences) {
      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json({
      emailNotifications: preferences.email_notifications,
      lowCreditAlerts: preferences.low_credit_alerts,
      purchaseConfirmations: preferences.purchase_confirmations,
      systemUpdates: preferences.system_updates
    });
  } catch (error) {
    console.error('Error in preferences fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});