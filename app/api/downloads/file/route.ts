import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getVersionByNumber, getLatestVersion } from '@/config/versions';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const requestedVersion = searchParams.get('version');
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Wymagane uwierzytelnienie' },
        { status: 401 }
      );
    }

    // Get version data - use latest if no version specified
    const versionData = requestedVersion 
      ? getVersionByNumber(requestedVersion)
      : getLatestVersion();
      
    if (!versionData) {
      return NextResponse.json(
        { error: 'Nieznana wersja aplikacji' },
        { status: 404 }
      );
    }

    // Get user's credit information
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
          message: 'Aby pobrać aplikację, musisz mieć kredyty na koncie.'
        },
        { status: 403 }
      );
    }

    // Get client IP and user agent for tracking
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log the download attempt
    const { data: downloadRecord, error: downloadLogError } = await supabase
      .from('app_downloads')
      .insert({
        user_id: session.user.id,
        version: versionData.version,
        download_url: versionData.filePath,
        file_size: versionData.fileSize,
        download_completed: false, // Will be updated when download completes
        ip_address: clientIP,
        user_agent: userAgent,
        downloaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (downloadLogError) {
      console.error('Error logging download:', downloadLogError);
      // Don't fail the download for logging errors, just log it
    }

    // In a real implementation, you would:
    // 1. Stream the file from cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Set appropriate headers for file download
    // 3. Handle large file streaming efficiently
    
    // For now, return a mock response indicating where the file would be served from
    return NextResponse.json({
      success: true,
      message: 'Pobieranie rozpoczęte',
      downloadInfo: {
        fileName: versionData.fileName,
        fileSize: versionData.fileSize,
        version: versionData.version,
        checksum: versionData.checksum,
        downloadId: downloadRecord?.id
      },
      // In production, this would be a direct file stream or redirect to signed URL
      mockDownloadUrl: versionData.filePath
    });

  } catch (error) {
    console.error('Error in /api/downloads/file:', error);
    return NextResponse.json(
      { error: 'Błąd podczas pobierania pliku' },
      { status: 500 }
    );
  }
}

// Mark download as completed
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { downloadId } = await request.json();
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Wymagane uwierzytelnienie' },
        { status: 401 }
      );
    }

    // Update download record as completed
    const { error: updateError } = await supabase
      .from('app_downloads')
      .update({ download_completed: true })
      .eq('id', downloadId)
      .eq('user_id', session.user.id); // Ensure user can only update their own downloads

    if (updateError) {
      console.error('Error updating download status:', updateError);
      return NextResponse.json(
        { error: 'Błąd podczas aktualizacji statusu pobierania' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status pobierania zaktualizowany'
    });

  } catch (error) {
    console.error('Error in POST /api/downloads/file:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}