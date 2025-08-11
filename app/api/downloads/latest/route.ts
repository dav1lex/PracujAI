import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getLatestVersion, INSTALLATION_INSTRUCTIONS } from '@/config/versions';

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

    // Check if user has credits or is early adopter
    if (!userCredits || (userCredits.balance <= 0 && !userCredits.is_early_adopter)) {
      return NextResponse.json(
        { 
          error: 'Brak wystarczających kredytów',
          message: 'Aby pobrać aplikację, musisz mieć kredyty na koncie lub być wczesnym użytkownikiem.'
        },
        { status: 403 }
      );
    }

    // Get latest version info
    const latestVersion = getLatestVersion();
    
    // Get download statistics for this version
    const { count: downloadCount } = await supabase
      .from('app_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('version', latestVersion.version);

    return NextResponse.json({
      success: true,
      data: {
        ...latestVersion,
        downloadUrl: `/api/downloads/file?version=${latestVersion.version}`,
        downloadCount: downloadCount || 0,
        installationInstructions: INSTALLATION_INSTRUCTIONS
      }
    });

  } catch (error) {
    console.error('Error in /api/downloads/latest:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}