import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

// Admin emails from environment variables
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [
  'admin@pracujmatcher.com',
  'support@pracujmatcher.com'
];

async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user || !ADMIN_EMAILS.includes(user.email || '')) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Admin verification error:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const adminUser = await verifyAdminAccess(request);
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = params;

  try {
    // Get comprehensive user information
    const [
      userInfo,
      creditInfo,
      transactions,
      sessions,
      downloads,
      supportTickets
    ] = await Promise.all([
      // Basic user info
      supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),
      
      // Credit information
      supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single(),
      
      // Recent transactions
      supabaseAdmin
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      
      // Active sessions
      supabaseAdmin
        .from('desktop_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Download history
      supabaseAdmin
        .from('app_downloads')
        .select('*')
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false })
        .limit(10),
      
      // Support tickets
      supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    if (userInfo.error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate user activity metrics
    const activityMetrics = {
      totalTransactions: transactions.data?.length || 0,
      totalCreditsUsed: transactions.data?.filter(t => t.transaction_type === 'consumption').reduce((sum, t) => sum + t.amount, 0) || 0,
      activeSessions: sessions.data?.filter(s => new Date(s.expires_at) > new Date()).length || 0,
      totalDownloads: downloads.data?.length || 0,
      openTickets: supportTickets.data?.filter(t => ['open', 'in_progress'].includes(t.status)).length || 0,
      lastActivity: getLastActivity(transactions.data, sessions.data, downloads.data)
    };

    return NextResponse.json({
      user: userInfo.data,
      credits: creditInfo.data,
      transactions: transactions.data || [],
      sessions: sessions.data || [],
      downloads: downloads.data || [],
      supportTickets: supportTickets.data || [],
      activityMetrics
    });

  } catch (error) {
    console.error('Admin user details API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const adminUser = await verifyAdminAccess(request);
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = params;

  try {
    const { action, ...actionData } = await request.json();

    switch (action) {
      case 'adjust_credits':
        return await adjustUserCredits(userId, actionData, adminUser.id);
      
      case 'reset_password':
        return await resetUserPassword(userId);
      
      case 'suspend_account':
        return await suspendUserAccount(userId, actionData.reason);
      
      case 'reactivate_account':
        return await reactivateUserAccount(userId);
      
      case 'add_note':
        return await addUserNote(userId, actionData.note, adminUser.id);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getLastActivity(
  transactions: { created_at: string }[], 
  sessions: { last_activity: string }[], 
  downloads: { downloaded_at: string }[]
): string {
  const allActivities = [
    ...(transactions || []).map(t => ({ date: t.created_at, type: 'transaction' })),
    ...(sessions || []).map(s => ({ date: s.last_activity, type: 'session' })),
    ...(downloads || []).map(d => ({ date: d.downloaded_at, type: 'download' }))
  ];

  if (allActivities.length === 0) return '';

  const latest = allActivities.reduce((latest, activity) => 
    new Date(activity.date) > new Date(latest.date) ? activity : latest
  );

  return latest.date;
}

async function adjustUserCredits(userId: string, data: { amount: number; description?: string }, adminId: string) {
  const { amount, description } = data;
  
  const { error } = await supabaseAdmin.rpc('add_credits_and_log_transaction', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description || `Admin adjustment: ${amount} credits`,
    p_transaction_type: 'grant',
    p_admin_id: adminId
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to adjust credits' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Credits adjusted successfully' });
}

async function resetUserPassword(userId: string) {
  // This would typically send a password reset email
  // For now, we'll just log the action
  console.log(`Admin requested password reset for user: ${userId}`);
  
  return NextResponse.json({ 
    success: true, 
    message: 'Password reset email would be sent to user' 
  });
}

async function suspendUserAccount(userId: string, reason: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ 
      is_suspended: true, 
      suspension_reason: reason,
      suspended_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ error: 'Failed to suspend account' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Account suspended successfully' });
}

async function reactivateUserAccount(userId: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ 
      is_suspended: false, 
      suspension_reason: null,
      suspended_at: null,
      reactivated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ error: 'Failed to reactivate account' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Account reactivated successfully' });
}

async function addUserNote(userId: string, note: string, adminId: string) {
  const { error } = await supabaseAdmin
    .from('admin_user_notes')
    .insert({
      user_id: userId,
      admin_id: adminId,
      note: note,
      created_at: new Date().toISOString()
    });

  if (error) {
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Note added successfully' });
}