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
  const status = searchParams.get('status') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    let query = supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        users!support_tickets_user_id_fkey(email)
      `, { count: 'exact' });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination and sorting
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
    }

    // Get ticket statistics
    const { data: stats } = await supabaseAdmin
      .from('support_tickets')
      .select('status')
      .then(({ data }) => {
        const statusCounts = data?.reduce((acc: Record<string, number>, ticket: { status: string }) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        return {
          data: {
            total: data?.length || 0,
            open: statusCounts.open || 0,
            in_progress: statusCounts.in_progress || 0,
            resolved: statusCounts.resolved || 0,
            closed: statusCounts.closed || 0
          }
        };
      });

    return NextResponse.json({
      tickets: tickets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: stats || { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 }
    });

  } catch (error) {
    console.error('Admin support API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await verifyAdminAccess(request);
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticketId, status, response, internal_notes } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Update ticket
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      admin_user_id: adminUser.id
    };

    if (status) updateData.status = status;
    if (response) updateData.admin_response = response;
    if (internal_notes) updateData.internal_notes = internal_notes;

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error updating support ticket:', error);
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // If there's a response, send email notification to user
    if (response) {
      // TODO: Implement email notification
      console.log('Would send email notification to user about ticket update');
    }

    return NextResponse.json({ success: true, ticket: data });

  } catch (error) {
    console.error('Admin support update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}