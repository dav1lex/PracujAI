import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AuditLogger, AuditEventType } from '@/utils/audit-logger';
import { SystemMonitor } from '@/utils/system-monitor';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { token } = await request.json();

    if (!token) {
      // Log invalid token attempt
      await AuditLogger.logSecurity(
        AuditEventType.INVALID_TOKEN,
        clientIP,
        userAgent,
        undefined,
        'Token validation attempt without token'
      );

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
      // Log invalid token
      await AuditLogger.logSecurity(
        AuditEventType.INVALID_TOKEN,
        clientIP,
        userAgent,
        undefined,
        'Desktop token validation failed - token not found',
        { token_hash: token.substring(0, 8) + '...' }
      );

      return NextResponse.json(
        { error: 'Nieprawidłowy token' },
        { status: 401 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(desktopSession.expires_at);
    
    if (now > expiresAt) {
      // Log expired session
      await AuditLogger.logAuth(
        AuditEventType.DESKTOP_SESSION_EXPIRE,
        desktopSession.user_id,
        desktopSession.id,
        clientIP,
        userAgent,
        { expired_at: expiresAt.toISOString() }
      );

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
      // Log user not found error
      await AuditLogger.logError(
        new Error('User not found during token validation'),
        'validate-token',
        desktopSession.user_id,
        { session_id: desktopSession.id }
      );

      return NextResponse.json(
        { error: 'Użytkownik nie znaleziony' },
        { status: 404 }
      );
    }

    // Log successful desktop authentication
    await AuditLogger.logAuth(
      AuditEventType.DESKTOP_AUTH,
      user.user.id,
      desktopSession.id,
      clientIP,
      userAgent,
      { 
        success: true,
        session_expires_at: desktopSession.expires_at,
        credit_balance: desktopSession.user_credits?.balance || 0
      }
    );

    // Record user activity
    await SystemMonitor.recordUserActivity(
      'desktop_token_validation',
      user.user.id,
      { session_id: desktopSession.id }
    );

    // Record API performance
    const responseTime = Date.now() - startTime;
    await SystemMonitor.recordAPIPerformance(
      '/api/auth/validate-token',
      'POST',
      200,
      responseTime,
      user.user.id
    );

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
    
    // Log the error
    await AuditLogger.logError(
      error instanceof Error ? error : new Error('Unknown error in validate-token'),
      'validate-token',
      undefined,
      { client_ip: clientIP, user_agent: userAgent }
    );

    // Record API performance for error case
    const responseTime = Date.now() - startTime;
    await SystemMonitor.recordAPIPerformance(
      '/api/auth/validate-token',
      'POST',
      500,
      responseTime
    );

    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}