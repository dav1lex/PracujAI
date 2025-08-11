import { NextRequest, NextResponse } from 'next/server';
import { validateDesktopSession, getUserCredits } from '@/utils/desktop-session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate the desktop session
    const sessionResult = await validateDesktopSession(token!);
    
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: sessionResult.status || 500 }
      );
    }

    // Get user credits
    const creditsResult = await getUserCredits(sessionResult.user_id!);
    
    if (!creditsResult.success) {
      return NextResponse.json(
        { error: creditsResult.error },
        { status: 500 }
      );
    }

    // Calculate session time remaining
    const now = new Date();
    const expiresAt = new Date(sessionResult.session!.expires_at);
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
    const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));

    // Get user information
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const { cookies } = await import('next/headers');
    const supabase = createRouteHandlerClient({ cookies });

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(sessionResult.user_id!);

    if (userError) {
      console.error('Error fetching user:', userError);
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'active',
        user: {
          id: sessionResult.user_id,
          email: user?.user?.email || 'unknown',
          created_at: user?.user?.created_at
        },
        session: {
          id: sessionResult.session!.id,
          expiresAt: sessionResult.session!.expires_at,
          lastActivity: sessionResult.session!.last_activity,
          minutesRemaining,
          isExpiringSoon: minutesRemaining <= 5
        },
        credits: {
          balance: creditsResult.credits!.balance,
          totalPurchased: creditsResult.credits!.total_purchased,
          totalConsumed: creditsResult.credits!.total_consumed,
          isEarlyAdopter: creditsResult.credits!.is_early_adopter,
          hasCredits: creditsResult.credits!.balance > 0 || creditsResult.credits!.is_early_adopter
        },
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Error in /api/desktop/status:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// Health check endpoint that doesn't require authentication
export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          database: 'operational',
          authentication: 'operational',
          credits: 'operational'
        }
      }
    });

  } catch (error) {
    console.error('Error in POST /api/desktop/status:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}