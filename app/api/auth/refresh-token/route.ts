import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

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
      .select('*')
      .eq('session_token', token)
      .single();

    if (sessionError || !desktopSession) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token' },
        { status: 401 }
      );
    }

    // Check if token has expired (allow refresh within 5 minutes of expiration)
    const now = new Date();
    const expiresAt = new Date(desktopSession.expires_at);
    const fiveMinutesAfterExpiry = new Date(expiresAt.getTime() + 5 * 60 * 1000);
    
    if (now > fiveMinutesAfterExpiry) {
      // Clean up expired session
      await supabase
        .from('desktop_sessions')
        .delete()
        .eq('id', desktopSession.id);

      return NextResponse.json(
        { error: 'Token wygasł i nie może być odświeżony' },
        { status: 401 }
      );
    }

    // Generate a new token
    const newSessionToken = randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Update the session with new token and expiration
    const { data: updatedSession, error: updateError } = await supabase
      .from('desktop_sessions')
      .update({
        session_token: newSessionToken,
        expires_at: newExpiresAt.toISOString(),
        last_activity: now.toISOString()
      })
      .eq('id', desktopSession.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating desktop session:', updateError);
      return NextResponse.json(
        { error: 'Błąd podczas odświeżania tokenu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionToken: newSessionToken,
        expiresAt: newExpiresAt.toISOString(),
        sessionId: updatedSession.id
      }
    });

  } catch (error) {
    console.error('Error in /api/auth/refresh-token:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}