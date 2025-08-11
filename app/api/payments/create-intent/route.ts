import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { withCors } from '@/utils/cors';
import { CREDIT_PACKAGES } from '@/types/credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = withCors(async function POST(request: NextRequest) {
  try {
    const { packageId } = await request.json();

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

    // Find the credit package
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    if (!creditPackage) {
      return NextResponse.json({ error: 'Nieprawidłowy pakiet kredytów' }, { status: 400 });
    }

    // Convert price to cents (Stripe expects amounts in smallest currency unit)
    const amountInCents = Math.round(creditPackage.price * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'pln', // Polish Zloty
      metadata: {
        user_id: user.id,
        package_id: packageId,
        credits: creditPackage.credits.toString(),
        package_name: creditPackage.name
      },
      description: `Zakup ${creditPackage.credits} kredytów - ${creditPackage.name}`,
      receipt_email: user.email || undefined,
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amountInCents,
      currency: 'pln',
      package: creditPackage
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Błąd podczas tworzenia płatności' },
      { status: 500 }
    );
  }
});