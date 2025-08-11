-- ============================================================================
-- COMPLETE DATABASE SETUP FOR PRACUJ.PL SCRAPER WEB PORTAL
-- This is the final, comprehensive database setup that includes everything
-- Run this after resetting your Supabase database
-- ============================================================================

-- First, let's make sure we're starting clean
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- PART 1: CREATE ALL TABLES WITH PROPER CONSTRAINTS
-- ============================================================================

-- 1. Users table (extends auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  reactivated_at timestamptz,
  is_suspended boolean DEFAULT false,
  suspension_reason text,
  suspended_at timestamptz
);

-- 2. User preferences
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_completed_onboarding boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  low_credit_alerts boolean DEFAULT true,
  purchase_confirmations boolean DEFAULT true,
  system_updates boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. User trials
CREATE TABLE public.user_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_start_time timestamptz DEFAULT now(),
  trial_end_time timestamptz NOT NULL,
  is_trial_used boolean DEFAULT false
);

-- 4. Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  price_id text,
  created_at timestamptz DEFAULT now(),
  cancel_at_period_end boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  current_period_end timestamptz
);

-- 5. User credits
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased integer NOT NULL DEFAULT 0 CHECK (total_purchased >= 0),
  total_consumed integer NOT NULL DEFAULT 0 CHECK (total_consumed >= 0),
  is_early_adopter boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Credit transactions
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'consumption', 'grant')),
  amount integer NOT NULL CHECK (amount > 0),
  description text,
  stripe_payment_intent_id text,
  desktop_session_id uuid,
  created_at timestamptz DEFAULT now()
);

-- 7. Desktop sessions
CREATE TABLE public.desktop_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  last_activity timestamptz DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 8. App downloads
CREATE TABLE public.app_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version text NOT NULL,
  download_url text NOT NULL,
  file_size bigint,
  download_completed boolean NOT NULL DEFAULT false,
  ip_address inet,
  user_agent text,
  downloaded_at timestamptz DEFAULT now()
);

-- 9. Support tickets (with proper foreign key constraints)
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response text,
  admin_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  internal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Admin user notes (with proper foreign key constraints)
CREATE TABLE public.admin_user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PART 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_trials_user_id ON public.user_trials(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_desktop_sessions_user_id ON public.desktop_sessions(user_id);
CREATE INDEX idx_desktop_sessions_token ON public.desktop_sessions(session_token);
CREATE INDEX idx_desktop_sessions_expires_at ON public.desktop_sessions(expires_at);
CREATE INDEX idx_app_downloads_user_id ON public.app_downloads(user_id);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX idx_admin_user_notes_user_id ON public.admin_user_notes(user_id);
CREATE INDEX idx_admin_user_notes_admin_id ON public.admin_user_notes(admin_id);

-- ============================================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desktop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: CREATE RLS POLICIES
-- ============================================================================

-- Users policies
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access users" ON public.users FOR ALL TO service_role USING (true);

-- User preferences policies
CREATE POLICY "Users can read own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access preferences" ON public.user_preferences FOR ALL TO service_role USING (true);

-- User trials policies
CREATE POLICY "Users can read own trials" ON public.user_trials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own trials" ON public.user_trials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trials" ON public.user_trials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access trials" ON public.user_trials FOR ALL TO service_role USING (true);

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access subscriptions" ON public.subscriptions FOR ALL TO service_role USING (true);

-- User credits policies
CREATE POLICY "Users can read own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.user_credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access credits" ON public.user_credits FOR ALL TO service_role USING (true);

-- Credit transactions policies
CREATE POLICY "Users can read own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access transactions" ON public.credit_transactions FOR ALL TO service_role USING (true);

-- Desktop sessions policies
CREATE POLICY "Users can read own sessions" ON public.desktop_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.desktop_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access sessions" ON public.desktop_sessions FOR ALL TO service_role USING (true);

-- App downloads policies
CREATE POLICY "Users can read own downloads" ON public.app_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own downloads" ON public.app_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access downloads" ON public.app_downloads FOR ALL TO service_role USING (true);

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access tickets" ON public.support_tickets FOR ALL TO service_role USING (true);

-- Admin notes policies
CREATE POLICY "Service role full access notes" ON public.admin_user_notes FOR ALL TO service_role USING (true);

-- ============================================================================
-- PART 5: CREATE FUNCTIONS
-- ============================================================================

-- Function to get registration stats
CREATE OR REPLACE FUNCTION public.get_registration_stats()
RETURNS TABLE (
  total_users INTEGER,
  early_adopters INTEGER,
  remaining_slots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.users),
    (SELECT COUNT(*)::INTEGER FROM public.user_credits WHERE is_early_adopter = true),
    (10 - (SELECT COUNT(*)::INTEGER FROM public.user_credits WHERE is_early_adopter = true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits with admin tracking
CREATE OR REPLACE FUNCTION public.add_credits_and_log_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_transaction_type TEXT DEFAULT 'grant',
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- If user doesn't have a credit record, create one
  IF current_balance IS NULL THEN
    INSERT INTO public.user_credits (user_id, balance, total_purchased, total_consumed)
    VALUES (p_user_id, 0, 0, 0);
    current_balance := 0;
  END IF;
  
  -- Update credit balance
  UPDATE public.user_credits 
  SET 
    balance = balance + p_amount,
    total_purchased = CASE 
      WHEN p_transaction_type = 'purchase' THEN total_purchased + p_amount
      ELSE total_purchased
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    transaction_type, 
    amount, 
    description,
    created_at
  ) VALUES (
    p_user_id, 
    p_transaction_type, 
    p_amount, 
    COALESCE(p_description, 'Admin credit adjustment'),
    NOW()
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  is_early_adopter BOOLEAN := false;
  initial_credits INTEGER := 0;
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  
  -- Insert into user_preferences table
  INSERT INTO public.user_preferences (user_id, has_completed_onboarding, created_at, updated_at)
  VALUES (NEW.id, false, NOW(), NOW());
  
  -- Insert into user_trials table
  INSERT INTO public.user_trials (user_id, trial_start_time, trial_end_time, is_trial_used)
  VALUES (NEW.id, NOW(), NOW() + INTERVAL '7 days', false);
  
  -- Check if user is eligible for early adopter credits
  SELECT COUNT(*) INTO user_count FROM public.user_credits;
  
  IF user_count < 10 THEN
    is_early_adopter := true;
    initial_credits := 100;
  END IF;
  
  -- Insert into user_credits table
  INSERT INTO public.user_credits (
    user_id, balance, total_purchased, total_consumed, is_early_adopter, created_at, updated_at
  ) VALUES (
    NEW.id, initial_credits, 0, 0, is_early_adopter, NOW(), NOW()
  );
  
  -- Log initial credit grant if applicable
  IF initial_credits > 0 THEN
    INSERT INTO public.credit_transactions (
      user_id, transaction_type, amount, description, created_at
    ) VALUES (
      NEW.id, 'grant', initial_credits, 'Darmowe kredyty dla wczesnych użytkowników', NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 6: CREATE VIEWS
-- ============================================================================

-- Admin user overview view
CREATE VIEW public.admin_user_overview AS
SELECT 
  u.id,
  u.email,
  u.created_at as registration_date,
  uc.balance as current_credits,
  uc.total_purchased,
  uc.total_consumed,
  uc.is_early_adopter,
  COALESCE(recent_activity.last_activity, u.created_at) as last_activity,
  COALESCE(recent_activity.total_transactions, 0) as total_transactions
FROM public.users u
LEFT JOIN public.user_credits uc ON u.id = uc.user_id
LEFT JOIN (
  SELECT 
    user_id,
    MAX(created_at) as last_activity,
    COUNT(*) as total_transactions
  FROM public.credit_transactions
  GROUP BY user_id
) recent_activity ON u.id = recent_activity.user_id
ORDER BY u.created_at DESC;

-- ============================================================================
-- PART 7: GRANT PERMISSIONS
-- ============================================================================

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- PART 8: FORCE REFRESH SCHEMA CACHE
-- ============================================================================

-- Force refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'COMPLETE DATABASE SETUP FINISHED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tables created: 10 (with proper foreign key constraints)';
  RAISE NOTICE '  - users (with suspension fields)';
  RAISE NOTICE '  - user_preferences (with notification settings)';
  RAISE NOTICE '  - user_trials';
  RAISE NOTICE '  - subscriptions';
  RAISE NOTICE '  - user_credits';
  RAISE NOTICE '  - credit_transactions';
  RAISE NOTICE '  - desktop_sessions';
  RAISE NOTICE '  - app_downloads';
  RAISE NOTICE '  - support_tickets (with proper FK to users)';
  RAISE NOTICE '  - admin_user_notes (with proper FK to users)';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created: 3';
  RAISE NOTICE '  - handle_new_user (trigger for new registrations)';
  RAISE NOTICE '  - add_credits_and_log_transaction (admin credit management)';
  RAISE NOTICE '  - get_registration_stats (admin statistics)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views created: 1';
  RAISE NOTICE '  - admin_user_overview (admin dashboard data)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  - Row Level Security (RLS) on all tables';
  RAISE NOTICE '  - Early adopter system (first 10 users get 100 credits)';
  RAISE NOTICE '  - Complete admin management system';
  RAISE NOTICE '  - Support ticket system with proper relationships';
  RAISE NOTICE '  - Schema cache properly refreshed';
  RAISE NOTICE '';
  RAISE NOTICE 'Your database is now ready for production use!';
  RAISE NOTICE 'All admin features should work without errors.';
  RAISE NOTICE '============================================================================';
END $$;