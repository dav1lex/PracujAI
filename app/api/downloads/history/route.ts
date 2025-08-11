import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Wymagane uwierzytelnienie' },
        { status: 401 }
      );
    }

    // Get user's download history
    const { data: downloads, error: downloadsError } = await supabase
      .from('app_downloads')
      .select('*')
      .eq('user_id', session.user.id)
      .order('downloaded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (downloadsError) {
      console.error('Error fetching download history:', downloadsError);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania historii' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('app_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    if (countError) {
      console.error('Error counting downloads:', countError);
    }

    return NextResponse.json({
      success: true,
      data: {
        downloads: downloads || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }
    });

  } catch (error) {
    console.error('Error in /api/downloads/history:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}