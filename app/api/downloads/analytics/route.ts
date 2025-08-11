import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, all
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Wymagane uwierzytelnienie' },
        { status: 401 }
      );
    }

    // Calculate date filter based on timeframe
    let dateFilter = '';
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = sevenDaysAgo.toISOString();
        break;
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = thirtyDaysAgo.toISOString();
        break;
      case '90d':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFilter = ninetyDaysAgo.toISOString();
        break;
      default:
        dateFilter = '1970-01-01T00:00:00.000Z'; // All time
    }

    // Get user's download statistics
    const { data: userDownloads, error: userDownloadsError } = await supabase
      .from('app_downloads')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('downloaded_at', dateFilter)
      .order('downloaded_at', { ascending: false });

    if (userDownloadsError) {
      console.error('Error fetching user downloads:', userDownloadsError);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania statystyk' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalDownloads = userDownloads?.length || 0;
    const completedDownloads = userDownloads?.filter(d => d.download_completed).length || 0;
    const failedDownloads = totalDownloads - completedDownloads;

    // Group downloads by version
    const downloadsByVersion = userDownloads?.reduce((acc, download) => {
      const version = download.version;
      if (!acc[version]) {
        acc[version] = {
          version,
          count: 0,
          completed: 0,
          totalSize: 0,
          lastDownload: null as string | null
        };
      }
      acc[version].count++;
      if (download.download_completed) {
        acc[version].completed++;
      }
      acc[version].totalSize += download.file_size || 0;
      if (!acc[version].lastDownload || download.downloaded_at > acc[version].lastDownload) {
        acc[version].lastDownload = download.downloaded_at;
      }
      return acc;
    }, {} as Record<string, {
      version: string;
      count: number;
      completed: number;
      totalSize: number;
      lastDownload: string | null;
    }>) || {};

    // Group downloads by date for chart data
    const downloadsByDate = userDownloads?.reduce((acc, download) => {
      const date = download.downloaded_at.split('T')[0]; // Get date part only
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>) || {};

    // Convert to array format for charts
    const chartData = Object.entries(downloadsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalDownloads,
          completedDownloads,
          failedDownloads,
          successRate: totalDownloads > 0 ? Math.round((completedDownloads / totalDownloads) * 100) : 0,
          timeframe
        },
        downloadsByVersion: Object.values(downloadsByVersion),
        chartData,
        recentDownloads: userDownloads?.slice(0, 10) || []
      }
    });

  } catch (error) {
    console.error('Error in /api/downloads/analytics:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}