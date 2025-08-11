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

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '7d';
  const userId = searchParams.get('userId');

  try {
    // Get credit analytics - removed unused dateFilter variable

    // Get transaction summary
    let transactionQuery = supabaseAdmin
      .from('credit_transactions')
      .select('*')
      .gte('created_at', new Date(Date.now() - getTimeframeMs(timeframe)).toISOString());

    if (userId) {
      transactionQuery = transactionQuery.eq('user_id', userId);
    }

    const { data: transactions, error: transactionError } = await transactionQuery
      .order('created_at', { ascending: false });

    if (transactionError) {
      console.error('Error fetching transactions:', transactionError);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // Calculate analytics
    const analytics = {
      totalTransactions: transactions?.length || 0,
      totalCreditsGranted: transactions?.filter(t => t.transaction_type === 'grant').reduce((sum, t) => sum + t.amount, 0) || 0,
      totalCreditsPurchased: transactions?.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + t.amount, 0) || 0,
      totalCreditsConsumed: transactions?.filter(t => t.transaction_type === 'consumption').reduce((sum, t) => sum + t.amount, 0) || 0,
      transactionsByType: {
        grant: transactions?.filter(t => t.transaction_type === 'grant').length || 0,
        purchase: transactions?.filter(t => t.transaction_type === 'purchase').length || 0,
        consumption: transactions?.filter(t => t.transaction_type === 'consumption').length || 0,
      },
      dailyStats: calculateDailyStats(transactions || [], timeframe)
    };

    // Get top users by credit usage
    const { data: topUsers, error: topUsersError } = await supabaseAdmin
      .from('admin_user_overview')
      .select('*')
      .order('total_consumed', { ascending: false })
      .limit(10);

    if (topUsersError) {
      console.error('Error fetching top users:', topUsersError);
    }

    return NextResponse.json({
      analytics,
      transactions: transactions?.slice(0, 50) || [], // Limit to 50 recent transactions
      topUsers: topUsers || []
    });

  } catch (error) {
    console.error('Admin credits API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await verifyAdminAccess(request);
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, amount, description, type = 'grant' } = await request.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Add credits using the existing function
    const { data, error } = await supabaseAdmin.rpc('add_credits_and_log_transaction', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description || `Admin ${type}: ${amount} credits`,
      p_transaction_type: type,
      p_admin_id: adminUser.id
    });

    if (error) {
      console.error('Error adjusting credits:', error);
      return NextResponse.json({ error: 'Failed to adjust credits' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Admin credit adjustment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getTimeframeMs(timeframe: string): number {
  switch (timeframe) {
    case '24h': return 24 * 60 * 60 * 1000;
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    case '90d': return 90 * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

interface Transaction {
  created_at: string;
  transaction_type: string;
  amount: number;
}

function calculateDailyStats(transactions: Transaction[], timeframe: string) {
  const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const dailyStats = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTransactions = transactions.filter(t => 
      t.created_at.startsWith(dateStr)
    );
    
    dailyStats.push({
      date: dateStr,
      grants: dayTransactions.filter(t => t.transaction_type === 'grant').reduce((sum, t) => sum + t.amount, 0),
      purchases: dayTransactions.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + t.amount, 0),
      consumption: dayTransactions.filter(t => t.transaction_type === 'consumption').reduce((sum, t) => sum + t.amount, 0),
      transactions: dayTransactions.length
    });
  }
  
  return dailyStats;
}