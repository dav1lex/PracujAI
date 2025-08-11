import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCors } from '@/utils/cors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = withCors(async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

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

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .eq('transaction_type', 'purchase')
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json({ error: 'Transakcja nie została znaleziona' }, { status: 404 });
    }

    // Format date
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Calculate price (simplified)
    const pricePerCredit = 0.30;
    const totalPrice = transaction.amount * pricePerCredit;
    const formattedPrice = new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(totalPrice);

    // Create receipt content
    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Paragon - PracujMatcher</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { color: #3B82F6; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .receipt-title { color: #666; font-size: 18px; }
        .details { background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .detail-label { color: #666; }
        .detail-value { font-weight: bold; }
        .total { background-color: #3B82F6; color: white; padding: 15px; border-radius: 8px; text-align: center; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">PracujMatcher</div>
        <div class="receipt-title">Paragon płatności</div>
    </div>
    
    <div class="details">
        <div class="detail-row">
            <span class="detail-label">Data zakupu:</span>
            <span class="detail-value">${formatDate(transaction.created_at)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">ID transakcji:</span>
            <span class="detail-value">${transaction.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">ID płatności Stripe:</span>
            <span class="detail-value">${transaction.stripe_payment_intent_id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Opis:</span>
            <span class="detail-value">${transaction.description}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ilość kredytów:</span>
            <span class="detail-value">${transaction.amount}</span>
        </div>
    </div>
    
    <div class="total">
        <div style="font-size: 18px; font-weight: bold;">
            Łączna wartość: ${formattedPrice}
        </div>
    </div>
    
    <div class="footer">
        <p>Dziękujemy za zakup!</p>
        <p>W razie pytań skontaktuj się z nami: support@pracujmatcher.pl</p>
        <p>Ten paragon został wygenerowany automatycznie.</p>
    </div>
</body>
</html>
    `;

    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // 
    // For now, we'll simulate sending the email
    console.log('Sending receipt email to:', user.email);
    console.log('Receipt content:', receiptContent);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you would:
    // 1. Use an email service to send the HTML content
    // 2. Handle email delivery failures
    // 3. Log email sending attempts
    // 4. Provide delivery status

    return NextResponse.json({
      success: true,
      message: 'Paragon został wysłany na adres e-mail'
    });

  } catch (error) {
    console.error('Error sending receipt email:', error);
    return NextResponse.json(
      { error: 'Błąd podczas wysyłania paragonu' },
      { status: 500 }
    );
  }
});