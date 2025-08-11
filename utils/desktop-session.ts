import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface DesktopSessionData {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  last_activity: string;
  created_at: string;
}

export interface SessionValidationResult {
  success: boolean;
  session?: DesktopSessionData;
  user_id?: string;
  error?: string;
  status?: number;
}

export async function validateDesktopSession(token: string): Promise<SessionValidationResult> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    if (!token) {
      return {
        success: false,
        error: 'Token jest wymagany',
        status: 400
      };
    }

    // Find the desktop session with this token
    const { data: desktopSession, error: sessionError } = await supabase
      .from('desktop_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (sessionError || !desktopSession) {
      return {
        success: false,
        error: 'Nieprawidłowy token sesji',
        status: 401
      };
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

      return {
        success: false,
        error: 'Sesja wygasła',
        status: 401
      };
    }

    // Update last activity
    await supabase
      .from('desktop_sessions')
      .update({ last_activity: now.toISOString() })
      .eq('id', desktopSession.id);

    return {
      success: true,
      session: desktopSession,
      user_id: desktopSession.user_id
    };

  } catch (error) {
    console.error('Error validating desktop session:', error);
    return {
      success: false,
      error: 'Błąd serwera',
      status: 500
    };
  }
}

export async function getUserCredits(userId: string) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (creditsError || !userCredits) {
      return {
        success: false,
        error: 'Błąd podczas pobierania salda kredytów'
      };
    }

    return {
      success: true,
      credits: userCredits
    };

  } catch (error) {
    console.error('Error getting user credits:', error);
    return {
      success: false,
      error: 'Błąd serwera'
    };
  }
}

export async function logDesktopActivity(userId: string, activity: string, metadata?: any) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // For now, we'll log to credit_transactions with a special type
    // In a production system, you might want a separate desktop_activity_logs table
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'consumption', // We'll use description to differentiate
        amount: 0, // No credits consumed for activity logging
        description: `Desktop Activity: ${activity}${metadata ? ` - ${JSON.stringify(metadata)}` : ''}`,
        created_at: new Date().toISOString()
      });

    return { success: true };

  } catch (error) {
    console.error('Error logging desktop activity:', error);
    return { success: false, error: 'Błąd podczas logowania aktywności' };
  }
}