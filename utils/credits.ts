// Credit System Utilities for Pracuj.pl Scraper Web Portal

import { supabase } from '@/utils/supabase';
import { 
  UserCredits, 
  CreditTransaction, 
  CreditBalanceResponse,
  CreditConsumptionRequest,
  CreditSystemError,
  CREDIT_CONSTANTS,
  CREDIT_ERROR_CODES,
  TRANSACTION_TYPES
} from '@/types/credits';

/**
 * Get user's current credit balance and summary
 */
export async function getUserCreditBalance(userId: string): Promise<CreditBalanceResponse> {
  try {
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch credit balance: ${error.message}`);
    }

    if (!credits) {
      // Create initial credit record if it doesn't exist
      const newCredits = await createInitialCreditRecord(userId);
      return {
        balance: newCredits.balance,
        total_purchased: newCredits.total_purchased,
        total_consumed: newCredits.total_consumed,
        is_early_adopter: newCredits.is_early_adopter,
        low_credit_warning: newCredits.balance <= CREDIT_CONSTANTS.LOW_CREDIT_THRESHOLD
      };
    }

    return {
      balance: credits.balance,
      total_purchased: credits.total_purchased,
      total_consumed: credits.total_consumed,
      is_early_adopter: credits.is_early_adopter,
      low_credit_warning: credits.balance <= CREDIT_CONSTANTS.LOW_CREDIT_THRESHOLD
    };
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    throw error;
  }
}

/**
 * Consume credits for job matching
 */
export async function consumeCredits(
  userId: string, 
  request: CreditConsumptionRequest
): Promise<{ success: boolean; new_balance: number; transaction_id: string }> {
  try {
    // Start a transaction
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance, total_consumed')
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentCredits) {
      throw new Error('User credits not found');
    }

    if (currentCredits.balance < request.amount) {
      throw new Error(CREDIT_ERROR_CODES.INSUFFICIENT_CREDITS);
    }

    const newBalance = currentCredits.balance - request.amount;
    const newTotalConsumed = currentCredits.total_consumed + request.amount;

    // Update credit balance
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_consumed: newTotalConsumed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update credit balance: ${updateError.message}`);
    }

    // Log the transaction
    const transactionId = await logCreditTransaction(
      userId,
      TRANSACTION_TYPES.CONSUMPTION,
      request.amount,
      request.description,
      undefined,
      request.desktop_session_id
    );

    return {
      success: true,
      new_balance: newBalance,
      transaction_id: transactionId
    };
  } catch (error) {
    console.error('Error consuming credits:', error);
    throw error;
  }
}

/**
 * Add credits to user account (for purchases or grants)
 */
export async function addCredits(
  userId: string,
  amount: number,
  transactionType: 'purchase' | 'grant',
  description: string,
  stripePaymentIntentId?: string
): Promise<{ success: boolean; new_balance: number; transaction_id: string }> {
  try {
    // Get current credits
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance, total_purchased')
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentCredits) {
      throw new Error('User credits not found');
    }

    const newBalance = currentCredits.balance + amount;
    const newTotalPurchased = transactionType === 'purchase' 
      ? currentCredits.total_purchased + amount 
      : currentCredits.total_purchased;

    // Update credit balance
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_purchased: newTotalPurchased,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update credit balance: ${updateError.message}`);
    }

    // Log the transaction
    const transactionId = await logCreditTransaction(
      userId,
      transactionType,
      amount,
      description,
      stripePaymentIntentId
    );

    return {
      success: true,
      new_balance: newBalance,
      transaction_id: transactionId
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
}

/**
 * Log a credit transaction
 */
export async function logCreditTransaction(
  userId: string,
  transactionType: 'purchase' | 'consumption' | 'grant',
  amount: number,
  description: string,
  stripePaymentIntentId?: string,
  desktopSessionId?: string
): Promise<string> {
  try {
    const { data: transaction, error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        amount: amount,
        description: description,
        stripe_payment_intent_id: stripePaymentIntentId,
        desktop_session_id: desktopSessionId
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to log transaction: ${error.message}`);
    }

    return transaction.id;
  } catch (error) {
    console.error('Error logging transaction:', error);
    throw error;
  }
}

/**
 * Get user's transaction history
 */
export async function getUserTransactionHistory(
  userId: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ transactions: CreditTransaction[]; total_count: number }> {
  try {
    const offset = (page - 1) * perPage;

    const { data: transactions, error, count } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) {
      throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }

    return {
      transactions: transactions || [],
      total_count: count || 0
    };
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

/**
 * Create initial credit record for new user
 */
export async function createInitialCreditRecord(userId: string): Promise<UserCredits> {
  try {
    // Check if user is eligible for early adopter credits
    const { count: userCount } = await supabase
      .from('user_credits')
      .select('*', { count: 'exact', head: true });

    const isEarlyAdopter = (userCount || 0) < CREDIT_CONSTANTS.EARLY_ADOPTER_LIMIT;
    const initialCredits = isEarlyAdopter ? CREDIT_CONSTANTS.FREE_CREDITS_AMOUNT : 0;

    const { data: credits, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        balance: initialCredits,
        total_purchased: 0,
        total_consumed: 0,
        is_early_adopter: isEarlyAdopter
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create credit record: ${error.message}`);
    }

    // Log the initial grant if credits were given
    if (initialCredits > 0) {
      await logCreditTransaction(
        userId,
        TRANSACTION_TYPES.GRANT,
        initialCredits,
        'Darmowe kredyty dla wczesnych użytkowników'
      );
    }

    return credits;
  } catch (error) {
    console.error('Error creating initial credit record:', error);
    throw error;
  }
}

/**
 * Check if user has sufficient credits
 */
export async function hasInsufficientCredits(userId: string, requiredAmount: number): Promise<boolean> {
  try {
    const balance = await getUserCreditBalance(userId);
    return balance.balance < requiredAmount;
  } catch (error) {
    console.error('Error checking credit sufficiency:', error);
    return true; // Assume insufficient on error for safety
  }
}

/**
 * Calculate credit usage statistics
 */
export async function getCreditUsageStats(userId: string): Promise<{
  daily_average: number;
  weekly_total: number;
  monthly_total: number;
  most_active_day: string;
}> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('amount, created_at')
      .eq('user_id', userId)
      .eq('transaction_type', 'consumption')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) {
      throw new Error(`Failed to fetch usage stats: ${error.message}`);
    }

    if (!transactions || transactions.length === 0) {
      return {
        daily_average: 0,
        weekly_total: 0,
        monthly_total: 0,
        most_active_day: 'Brak danych'
      };
    }

    const monthlyTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
    const dailyAverage = monthlyTotal / 30;

    // Calculate weekly total (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyTransactions = transactions.filter(t => 
      new Date(t.created_at) >= sevenDaysAgo
    );
    const weeklyTotal = weeklyTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Find most active day
    const dayUsage: { [key: string]: number } = {};
    transactions.forEach(t => {
      const day = new Date(t.created_at).toLocaleDateString('pl-PL', { weekday: 'long' });
      dayUsage[day] = (dayUsage[day] || 0) + t.amount;
    });

    const mostActiveDay = Object.keys(dayUsage).reduce((a, b) => 
      dayUsage[a] > dayUsage[b] ? a : b, 'Brak danych'
    );

    return {
      daily_average: Math.round(dailyAverage * 100) / 100,
      weekly_total: weeklyTotal,
      monthly_total: monthlyTotal,
      most_active_day: mostActiveDay
    };
  } catch (error) {
    console.error('Error calculating usage stats:', error);
    return {
      daily_average: 0,
      weekly_total: 0,
      monthly_total: 0,
      most_active_day: 'Błąd obliczania'
    };
  }
}

/**
 * Validate credit transaction amount
 */
export function validateCreditAmount(amount: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(amount) || amount <= 0) {
    return {
      valid: false,
      error: 'Ilość kredytów musi być liczbą całkowitą większą od zera'
    };
  }

  if (amount > 1000) {
    return {
      valid: false,
      error: 'Maksymalna ilość kredytów w jednej transakcji to 1000'
    };
  }

  return { valid: true };
}

/**
 * Format credit amount for display
 */
export function formatCreditAmount(amount: number): string {
  return `${amount} ${amount === 1 ? 'kredyt' : amount < 5 ? 'kredyty' : 'kredytów'}`;
}

/**
 * Format transaction description for display
 */
export function formatTransactionDescription(transaction: CreditTransaction): string {
  switch (transaction.transaction_type) {
    case 'purchase':
      return `Zakup ${formatCreditAmount(transaction.amount)}`;
    case 'consumption':
      return transaction.description || `Wykorzystanie ${formatCreditAmount(transaction.amount)}`;
    case 'grant':
      return transaction.description || `Przyznanie ${formatCreditAmount(transaction.amount)}`;
    default:
      return transaction.description || 'Nieznana transakcja';
  }
}