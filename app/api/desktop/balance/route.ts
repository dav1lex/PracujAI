import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token jest wymagany' },
        { status: 400 }
      );
    }

    // Validate the desktop session token
    const { data: desktopSession, error: sessionError } = await supabase
      .from('desktop_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (sessionError || !desktopSession) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token sesji' },
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
        { error: 'Sesja wygasła' },
        { status: 401 }
      );
    }

    // Get current credit balance and user info
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', desktopSession.user_id)
      .single();

    if (creditsError || !userCredits) {
      return NextResponse.json(
        { error: 'Błąd podczas pobierania salda kredytów' },
        { status: 500 }
      );
    }

    // Get recent transactions for context
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', desktopSession.user_id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (transactionsError) {
      console.error('Error fetching recent transactions:', transactionsError);
    }

    // Update session last activity
    await supabase
      .from('desktop_sessions')
      .update({ last_activity: now.toISOString() })
      .eq('id', desktopSession.id);

    return NextResponse.json({
      success: true,
      data: {
        balance: userCredits.balance,
        totalPurchased: userCredits.total_purchased,
        totalConsumed: userCredits.total_consumed,
        isEarlyAdopter: userCredits.is_early_adopter,
        lastUpdated: userCredits.updated_at,
        session: {
          id: desktopSession.id,
          expiresAt: desktopSession.expires_at,
          lastActivity: now.toISOString()
        },
        recentTransactions: recentTransactions || []
      }
    });

  } catch (error) {
    console.error('Error in /api/desktop/balance:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}