import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getAllVersions } from '@/config/versions';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Wymagane uwierzytelnienie' },
        { status: 401 }
      );
    }

    // Get user's credit information to verify they have access
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance, is_early_adopter')
      .eq('user_id', session.user.id)
      .single();

    if (creditsError) {
      console.error('Error fetching user credits:', creditsError);
      return NextResponse.json(
        { error: 'Błąd podczas sprawdzania uprawnień' },
        { status: 500 }
      );
    }

    // Check if user has access
    if (!userCredits || (userCredits.balance <= 0 && !userCredits.is_early_adopter)) {
      return NextResponse.json(
        { 
          error: 'Brak wystarczających kredytów',
          message: 'Aby uzyskać dostęp do wersji aplikacji, musisz mieć kredyty na koncie.'
        },
        { status: 403 }
      );
    }

    // Get all available versions
    const versions = getAllVersions();
    
    // Get download statistics for each version
    const versionsWithStats = await Promise.all(
      versions.map(async (version) => {
        const { count: downloadCount } = await supabase
          .from('app_downloads')
          .select('*', { count: 'exact', head: true })
          .eq('version', version.version);

        const { count: userDownloadCount } = await supabase
          .from('app_downloads')
          .select('*', { count: 'exact', head: true })
          .eq('version', version.version)
          .eq('user_id', session.user.id);

        return {
          ...version,
          downloadUrl: `/api/downloads/file?version=${version.version}`,
          totalDownloads: downloadCount || 0,
          userDownloads: userDownloadCount || 0,
          downloadedByUser: (userDownloadCount || 0) > 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        versions: versionsWithStats,
        totalVersions: versions.length
      }
    });

  } catch (error) {
    console.error('Error in /api/downloads/versions:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}