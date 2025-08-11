import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateDesktopSession, getUserCredits } from '@/utils/desktop-session';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { token, amount, description } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Nieprawidłowa liczba kredytów' },
        { status: 400 }
      );
    }

    // Validate the desktop session
    const sessionResult = await validateDesktopSession(token);
    
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: sessionResult.status || 500 }
      );
    }

    // Get current credit balance
    const creditsResult = await getUserCredits(sessionResult.user_id!);
    
    if (!creditsResult.success) {
      return NextResponse.json(
        { error: creditsResult.error },
        { status: 500 }
      );
    }

    const userCredits = creditsResult.credits!;

    // Check if user has sufficient credits (early adopters get unlimited credits)
    if (!userCredits.is_early_adopter && userCredits.balance < amount) {
      return NextResponse.json(
        { 
          error: 'Niewystarczająca liczba kredytów',
          currentBalance: userCredits.balance,
          requiredAmount: amount
        },
        { status: 403 }
      );
    }

    // Start a transaction to consume credits
    const now = new Date();
    const { data: updatedCredits, error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: userCredits.is_early_adopter ? userCredits.balance : userCredits.balance - amount,
        total_consumed: userCredits.total_consumed + amount,
        updated_at: now.toISOString()
      })
      .eq('user_id', sessionResult.user_id!)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return NextResponse.json(
        { error: 'Błąd podczas aktualizacji kredytów' },
        { status: 500 }
      );
    }

    // Log the credit consumption transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: sessionResult.user_id!,
        transaction_type: 'consumption',
        amount: -amount, // Negative for consumption
        description: description || 'Zużycie kredytów przez aplikację desktop',
        created_at: now.toISOString()
      });

    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Don't fail the request for logging errors
    }

    return NextResponse.json({
      success: true,
      data: {
        creditsConsumed: amount,
        remainingBalance: updatedCredits.balance,
        isEarlyAdopter: updatedCredits.is_early_adopter,
        totalConsumed: updatedCredits.total_consumed,
        transactionTime: now.toISOString(),
        sessionId: sessionResult.session?.id
      }
    });

  } catch (error) {
    console.error('Error in /api/desktop/consume-credits:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}