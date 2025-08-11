import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCors } from '@/utils/cors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = withCors(async function GET(request: NextRequest) {
  try {
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Nieprawidłowy token autoryzacji' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get payment transactions (purchases only)
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('transaction_type', 'purchase')
      .not('stripe_payment_intent_id', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (transactionsError) {
      console.error('Error fetching payment history:', transactionsError);
      return NextResponse.json({ error: 'Błąd podczas pobierania historii płatności' }, { status: 500 });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('transaction_type', 'purchase')
      .not('stripe_payment_intent_id', 'is', null);

    if (countError) {
      console.error('Error counting payment history:', countError);
      return NextResponse.json({ error: 'Błąd podczas pobierania historii płatności' }, { status: 500 });
    }

    return NextResponse.json({
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in payment history endpoint:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
});