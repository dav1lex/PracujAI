import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Clean up expired sessions
    const now = new Date().toISOString();
    const { data: deletedSessions, error: deleteError } = await supabase
      .from('desktop_sessions')
      .delete()
      .lt('expires_at', now)
      .select();

    if (deleteError) {
      console.error('Error cleaning up expired sessions:', deleteError);
      return NextResponse.json(
        { error: 'Błąd podczas czyszczenia sesji' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cleanedSessions: deletedSessions?.length || 0,
        message: `Usunięto ${deletedSessions?.length || 0} wygasłych sesji`
      }
    });

  } catch (error) {
    console.error('Error in /api/auth/cleanup-sessions:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// Also allow GET for easier testing
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Clean up expired sessions
    const now = new Date().toISOString();
    const { data: deletedSessions, error: deleteError } = await supabase
      .from('desktop_sessions')
      .delete()
      .lt('expires_at', now)
      .select();

    if (deleteError) {
      console.error('Error cleaning up expired sessions:', deleteError);
      return NextResponse.json(
        { error: 'Błąd podczas czyszczenia sesji' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cleanedSessions: deletedSessions?.length || 0,
        message: `Usunięto ${deletedSessions?.length || 0} wygasłych sesji`
      }
    });

  } catch (error) {
    console.error('Error in GET /api/auth/cleanup-sessions:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}