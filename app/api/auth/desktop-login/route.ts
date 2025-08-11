import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { redirectUrl } = await request.json();
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Wymagane uwierzytelnienie' },
        { status: 401 }
      );
    }

    // Generate a secure token for desktop authentication
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store the desktop session in the database
    const { data: desktopSession, error: sessionError } = await supabase
      .from('desktop_sessions')
      .insert({
        user_id: session.user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating desktop session:', sessionError);
      return NextResponse.json(
        { error: 'Błąd podczas tworzenia sesji' },
        { status: 500 }
      );
    }

    // Create the redirect URL with the token
    const authUrl = new URL(redirectUrl || 'pracujmatcher://auth');
    authUrl.searchParams.set('token', sessionToken);
    authUrl.searchParams.set('expires', expiresAt.getTime().toString());
    authUrl.searchParams.set('user_id', session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        redirectUrl: authUrl.toString(),
        sessionId: desktopSession.id
      }
    });

  } catch (error) {
    console.error('Error in /api/auth/desktop-login:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// Handle GET request for browser-based authentication flow
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect_url') || 'pracujmatcher://auth';
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      // Redirect to login page with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `/api/auth/desktop-login?redirect_url=${encodeURIComponent(redirectUrl)}`);
      
      return NextResponse.redirect(loginUrl.toString());
    }

    // Generate a secure token for desktop authentication
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store the desktop session in the database
    const { error: sessionError } = await supabase
      .from('desktop_sessions')
      .insert({
        user_id: session.user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      });

    if (sessionError) {
      console.error('Error creating desktop session:', sessionError);
      return NextResponse.json(
        { error: 'Błąd podczas tworzenia sesji' },
        { status: 500 }
      );
    }

    // Create the redirect URL with the token
    const authUrl = new URL(redirectUrl);
    authUrl.searchParams.set('token', sessionToken);
    authUrl.searchParams.set('expires', expiresAt.getTime().toString());
    authUrl.searchParams.set('user_id', session.user.id);

    // Redirect to the desktop application with the token
    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    console.error('Error in GET /api/auth/desktop-login:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}