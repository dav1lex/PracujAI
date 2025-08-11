import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { withCors } from '@/utils/cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function for consistent logging
function logWebhookEvent(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] WEBHOOK: ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Define interfaces for stored data
interface StoredSessionData {
  userId: string;
  customerId: string;
}

interface StoredSubscriptionData {
  id: string;
  customer: string;
}

// Store both checkout sessions and subscriptions temporarily
const checkoutSessionMap = new Map<string, StoredSessionData>();
const pendingSubscriptions = new Map<string, StoredSubscriptionData>();

// Need to disable body parsing for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

async function checkExistingSubscription(customerId: string): Promise<boolean> {
  const { data: existingSubs } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .in('status', ['active', 'trialing'])
    .single();

  return !!existingSubs;
}

// Currently Handled Events:
// 1. checkout.session.completed - When a customer completes checkout
// 2. customer.subscription.created - When a new subscription is created
// 3. customer.subscription.updated - When a subscription is updated
// 4. customer.subscription.deleted - When a subscription is cancelled/deleted
// 5. customer.subscription.pending_update_applied - When a pending update is applied
// 6. customer.subscription.pending_update_expired - When a pending update expires
// 7. customer.subscription.trial_will_end - When a trial is about to end

// Other Important Events You Might Want to Handle:
// Payment Related:
// - invoice.paid - When an invoice is paid successfully
// - invoice.payment_failed - When a payment fails
// - invoice.upcoming - When an invoice is going to be created
// - payment_intent.succeeded - When a payment is successful
// - payment_intent.payment_failed - When a payment fails

// Customer Related:
// - customer.created - When a new customer is created
// - customer.updated - When customer details are updated
// - customer.deleted - When a customer is deleted

// Subscription Related:
// - customer.subscription.paused - When a subscription is paused
// - customer.subscription.resumed - When a subscription is resumed
// - customer.subscription.trial_will_end - 3 days before trial ends

// Checkout Related:
// - checkout.session.async_payment_succeeded - Async payment success
// - checkout.session.async_payment_failed - Async payment failure
// - checkout.session.expired - When checkout session expires

export const POST = withCors(async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  try {
    logWebhookEvent('Received webhook request');
    logWebhookEvent('Stripe signature', sig);

    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logWebhookEvent(`Event received: ${event.type}`, event.data.object);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check for existing active subscription
        const hasActiveSubscription = await checkExistingSubscription(session.customer as string);
        
        if (hasActiveSubscription) {
          logWebhookEvent('Duplicate subscription attempt blocked', {
            customerId: session.customer,
            sessionId: session.id
          });
          
          // Cancel the new subscription immediately
          if (session.subscription) {
            await stripe.subscriptions.cancel(session.subscription as string);
          }
          
          return NextResponse.json({ 
            status: 'blocked',
            message: 'Customer already has an active subscription'
          });
        }

        logWebhookEvent('Processing checkout.session.completed', {
          sessionId: session.id,
          clientReferenceId: session.client_reference_id,
          customerId: session.customer,
          subscriptionId: session.subscription
        });

        if (!session.client_reference_id || !session.customer || !session.subscription) {
          logWebhookEvent('Missing required session data', {
            clientReferenceId: session.client_reference_id,
            customerId: session.customer,
            subscriptionId: session.subscription
          });
          return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
        }

        try {
          const subscription = await createSubscription(
            session.subscription as string,
            session.client_reference_id!,
            session.customer as string
          );
          logWebhookEvent('Successfully created subscription', subscription);
        } catch (error) {
          logWebhookEvent('Failed to create subscription', error);
          throw error;
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Check if we have the session data already
        const sessionData = checkoutSessionMap.get(subscription.id);
        if (sessionData) {
          // We can create the subscription now
          await createSubscription(
            subscription.id,
            sessionData.userId,
            sessionData.customerId
          );
          checkoutSessionMap.delete(subscription.id);
        } else {
          // Store the subscription data until we get the session
          pendingSubscriptions.set(subscription.id, {
            id: subscription.id,
            customer: subscription.customer as string
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.pending_update_applied':
      case 'customer.subscription.pending_update_expired':
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: false,
            current_period_end: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        logWebhookEvent('Processing payment_intent.succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        });

        // Extract metadata
        const { user_id, package_id, credits } = paymentIntent.metadata;
        
        if (!user_id || !package_id || !credits) {
          logWebhookEvent('Missing required metadata in payment intent', paymentIntent.metadata);
          return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 });
        }

        try {
          // Add credits to user account
          const { data: creditResult, error: creditError } = await supabaseAdmin
            .rpc('add_credits_and_log_transaction', {
              p_user_id: user_id,
              p_amount: parseInt(credits),
              p_transaction_type: 'purchase',
              p_description: `Zakup pakietu ${package_id} - ${credits} kredytów`,
              p_stripe_payment_intent_id: paymentIntent.id
            });

          if (creditError) {
            logWebhookEvent('Error adding credits', creditError);
            throw creditError;
          }

          logWebhookEvent('Successfully added credits', {
            userId: user_id,
            credits: credits,
            newBalance: creditResult
          });

        } catch (error) {
          logWebhookEvent('Failed to process payment intent', error);
          throw error;
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        logWebhookEvent('Processing payment_intent.payment_failed', {
          paymentIntentId: paymentIntent.id,
          lastPaymentError: paymentIntent.last_payment_error,
          metadata: paymentIntent.metadata
        });

        // Log failed payment attempt
        const { user_id, package_id } = paymentIntent.metadata;
        
        if (user_id) {
          try {
            await supabaseAdmin
              .from('credit_transactions')
              .insert({
                user_id: user_id,
                transaction_type: 'purchase',
                amount: 0,
                description: `Nieudana płatność za pakiet ${package_id}`,
                stripe_payment_intent_id: paymentIntent.id,
                created_at: new Date().toISOString()
              });
          } catch (error) {
            logWebhookEvent('Error logging failed payment', error);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logWebhookEvent('Webhook error', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
});

async function createSubscription(subscriptionId: string, userId: string, customerId: string) {
  logWebhookEvent('Starting createSubscription', { subscriptionId, userId, customerId });

  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    logWebhookEvent('Retrieved Stripe subscription', stripeSubscription);

    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (checkError) {
      logWebhookEvent('Error checking existing subscription', checkError);
    }

    if (existingData) {
      logWebhookEvent('Found existing subscription', existingData);
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: stripeSubscription.status,
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId)
        .select()
        .single();

      if (updateError) {
        logWebhookEvent('Error updating existing subscription', updateError);
        throw updateError;
      }
      return existingData;
    }

    logWebhookEvent('Creating new subscription record');
    const { data, error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: stripeSubscription.status,
        price_id: stripeSubscription.items.data[0]?.price.id,
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      logWebhookEvent('Error inserting new subscription', insertError);
      throw insertError;
    }

    logWebhookEvent('Successfully created new subscription', data);
    return data;
  } catch (error) {
    logWebhookEvent('Error in createSubscription', error);
    throw error;
  }
} 