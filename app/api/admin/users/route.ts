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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'registration_date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    try {
        let query = supabaseAdmin
            .from('admin_user_overview')
            .select('*', { count: 'exact' });

        // Apply search filter
        if (search) {
            query = query.or(`email.ilike.%${search}%,id.eq.${search}`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: users, error, count } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        // Get system statistics
        const { data: stats } = await supabaseAdmin.rpc('get_registration_stats');

        return NextResponse.json({
            users: users || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            stats: stats || {
                total_users: 0,
                early_adopters: 0,
                remaining_slots: 10
            }
        });

    } catch (error) {
        console.error('Admin users API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}