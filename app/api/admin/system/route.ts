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

export async function GET(request: NextRequest) {
  const adminUser = await verifyAdminAccess(request);
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get system health metrics
    const [
      registrationStats,
      creditStats,
      sessionStats,
      downloadStats,
      recentErrors
    ] = await Promise.all([
      // Registration statistics
      supabaseAdmin.rpc('get_registration_stats'),
      
      // Credit system statistics
      supabaseAdmin
        .from('credit_transactions')
        .select('transaction_type, amount, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      // Active sessions
      supabaseAdmin
        .from('desktop_sessions')
        .select('*')
        .gt('expires_at', new Date().toISOString()),
      
      // Recent downloads
      supabaseAdmin
        .from('app_downloads')
        .select('*')
        .gte('downloaded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      // Recent errors (if you have an error logging table)
      // For now, we'll return empty array
      Promise.resolve([])
    ]);

    // Calculate system metrics
    const systemMetrics = {
      users: {
        total: registrationStats.data?.total_users || 0,
        earlyAdopters: registrationStats.data?.early_adopters || 0,
        remainingSlots: registrationStats.data?.remaining_slots || 0,
        registrationsToday: await getRegistrationsToday()
      },
      credits: {
        totalTransactions: creditStats.data?.length || 0,
        creditsGrantedToday: creditStats.data?.filter((t: { transaction_type: string }) => t.transaction_type === 'grant').reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0,
        creditsPurchasedToday: creditStats.data?.filter((t: { transaction_type: string }) => t.transaction_type === 'purchase').reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0,
        creditsConsumedToday: creditStats.data?.filter((t: { transaction_type: string }) => t.transaction_type === 'consumption').reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0
      },
      sessions: {
        activeSessions: sessionStats.data?.length || 0,
        averageSessionDuration: calculateAverageSessionDuration(sessionStats.data || [])
      },
      downloads: {
        downloadsToday: downloadStats.data?.length || 0,
        uniqueDownloaders: new Set(downloadStats.data?.map((d: { user_id: string }) => d.user_id) || []).size
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        errors: recentErrors.length || 0
      }
    };

    // Get recent activity
    const { data: recentActivity } = await supabaseAdmin
      .from('credit_transactions')
      .select(`
        *,
        users(email)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      metrics: systemMetrics,
      recentActivity: recentActivity || []
    });

  } catch (error) {
    console.error('Admin system API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getRegistrationsToday(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());
    
  return count || 0;
}

function calculateAverageSessionDuration(sessions: { created_at: string; last_activity: string }[]): number {
  if (sessions.length === 0) return 0;
  
  const totalDuration = sessions.reduce((sum, session) => {
    const created = new Date(session.created_at).getTime();
    const lastActivity = new Date(session.last_activity).getTime();
    return sum + (lastActivity - created);
  }, 0);
  
  return Math.round(totalDuration / sessions.length / 1000 / 60); // Average in minutes
}