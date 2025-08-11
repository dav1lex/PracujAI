import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token jest wymagany' },
        { status: 400 }
      );
    }

    // Find the desktop session with this token
    const { data: desktopSession, error: sessionError } = await supabase
      .from('desktop_sessions')
      .select(`
        *,
        user_credits (
          balance,
          is_early_adopter
        )
      `)
      .eq('session_token', token)
      .single();

    if (sessionError || !desktopSession) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token' },
        { status: 401 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(desktopSession.expires_at);
    
    if (now > expiresAt) {
      // Clean up expired session
      await supabase
        .from('desktop_sessions')
        .delete()
        .eq('id', desktopSession.id);

      return NextResponse.json(
        { error: 'Token wygasł' },
        { status: 401 }
      );
    }

    // Update last activity
    await supabase
      .from('desktop_sessions')
      .update({ last_activity: now.toISOString() })
      .eq('id', desktopSession.id);

    // Get user information
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(desktopSession.user_id);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Użytkownik nie znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.user.id,
          email: user.user.email,
          created_at: user.user.created_at
        },
        session: {
          id: desktopSession.id,
          expires_at: desktopSession.expires_at,
          last_activity: desktopSession.last_activity
        },
        credits: {
          balance: desktopSession.user_credits?.balance || 0,
          is_early_adopter: desktopSession.user_credits?.is_early_adopter || false
        }
      }
    });

  } catch (error) {
    console.error('Error in /api/auth/validate-token:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}