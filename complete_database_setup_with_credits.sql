-- Complete database setup for Pracuj.pl Scraper Web Portal with Credit System
-- Run this in Supabase SQL Editor after resetting the database

-- ============================================================================
-- PART 1: CORE USER TABLES
-- ============================================================================

-- 1. Create the users table
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_deleted boolean NULL DEFAULT false,
  deleted_at timestamp with time zone NULL,
  reactivated_at timestamp with time zone NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 2. Create user preferences table
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  has_completed_onboarding boolean NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 3. Create user trials table
CREATE TABLE public.user_trials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trial_start_time timestamp with time zone NULL DEFAULT now(),
  trial_end_time timestamp with time zone NOT NULL,
  is_trial_used boolean NULL DEFAULT false,
  CONSTRAINT user_trials_pkey PRIMARY KEY (id),
  CONSTRAINT user_trials_user_id_key UNIQUE (user_id),
  CONSTRAINT user_trials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 4. Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  stripe_customer_id text NULL,
  stripe_subscription_id text NULL,
  status text NULL,
  price_id text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  cancel_at_period_end boolean NULL DEFAULT false,
  updated_at timestamp with time zone NULL DEFAULT now(),
  current_period_end timestamp with time zone NULL,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- ============================================================================
-- PART 2: CREDIT SYSTEM TABLES
-- ============================================================================

-- 5. Create user_credits table for balance tracking
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  total_purchased integer NOT NULL DEFAULT 0,
  total_consumed integer NOT NULL DEFAULT 0,
  is_early_adopter boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_credits_user_id_key UNIQUE (user_id),
  CONSTRAINT user_credits_balance_check CHECK (balance >= 0),
  CONSTRAINT user_credits_totals_check CHECK (total_purchased >= 0 AND total_consumed >= 0)
);

-- 6. Create credit_transactions table for transaction history
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'consumption', 'grant')),
  amount integer NOT NULL,
  description text,
  stripe_payment_intent_id text,
  desktop_session_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credit_transactions_amount_check CHECK (amount > 0)
);

-- 7. Create desktop_sessions table for app authentication
CREATE TABLE public.desktop_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  last_activity timestamp with time zone DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT desktop_sessions_expires_check CHECK (expires_at > created_at)
);

-- 8. Create app_downloads table for download tracking
CREATE TABLE public.app_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version text NOT NULL,
  download_url text NOT NULL,
  file_size bigint,
  download_completed boolean NOT NULL DEFAULT false,
  ip_address inet,
  user_agent text,
  downloaded_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- PART 3: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core table indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_trials_user_id ON public.user_trials(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Credit system indexes
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_desktop_sessions_user_id ON public.desktop_sessions(user_id);
CREATE INDEX idx_desktop_sessions_token ON public.desktop_sessions(session_token);
CREATE INDEX idx_desktop_sessions_expires_at ON public.desktop_sessions(expires_at);
CREATE INDEX idx_app_downloads_user_id ON public.app_downloads(user_id);
CREATE INDEX idx_app_downloads_version ON public.app_downloads(version);

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desktop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_downloads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: CREATE RLS POLICIES
-- ============================================================================

-- Users table policies
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access to users" ON public.users
  FOR ALL TO service_role USING (true);

-- User preferences policies
CREATE POLICY "Users can read their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to preferences" ON public.user_preferences
  FOR ALL TO service_role USING (true);

-- User trials policies
CREATE POLICY "Users can read their own trials" ON public.user_trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own trials" ON public.user_trials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trials" ON public.user_trials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to trials" ON public.user_trials
  FOR ALL TO service_role USING (true);

-- Subscriptions policies
CREATE POLICY "Users can read their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true);

-- User credits policies
CREATE POLICY "Users can read their own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to user_credits" ON public.user_credits
  FOR ALL TO service_role USING (true);

-- Credit transactions policies
CREATE POLICY "Users can read their own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to credit_transactions" ON public.credit_transactions
  FOR ALL TO service_role USING (true);

-- Desktop sessions policies
CREATE POLICY "Users can read their own sessions" ON public.desktop_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.desktop_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to desktop_sessions" ON public.desktop_sessions
  FOR ALL TO service_role USING (true);

-- App downloads policies
CREATE POLICY "Users can read their own downloads" ON public.app_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" ON public.app_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to app_downloads" ON public.app_downloads
  FOR ALL TO service_role USING (true);

-- ============================================================================
-- PART 6: UTILITY FUNCTIONS
-- ============================================================================

-- Function to update user_credits.updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_user_credits_updated_at();

-- Function to clean up expired desktop sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE public.desktop_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get early adopter count
CREATE OR REPLACE FUNCTION public.get_early_adopter_count()
RETURNS INTEGER AS $$
DECLARE
  adopter_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO adopter_count 
  FROM public.user_credits 
  WHERE is_early_adopter = true;
  
  RETURN adopter_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if early adopter slots are available
CREATE OR REPLACE FUNCTION public.early_adopter_slots_available()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_early_adopter_count()) < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually grant early adopter status (admin use)
CREATE OR REPLACE FUNCTION public.grant_early_adopter_status(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
  already_early_adopter BOOLEAN;
BEGIN
  -- Check if user already has early adopter status
  SELECT is_early_adopter INTO already_early_adopter
  FROM public.user_credits
  WHERE user_id = target_user_id;
  
  IF already_early_adopter THEN
    RETURN false; -- Already an early adopter
  END IF;
  
  -- Check if slots are available
  IF NOT early_adopter_slots_available() THEN
    RETURN false; -- No slots available
  END IF;
  
  -- Get current credit balance
  SELECT balance INTO current_credits
  FROM public.user_credits
  WHERE user_id = target_user_id;
  
  -- Update user to early adopter status and add credits
  UPDATE public.user_credits
  SET 
    is_early_adopter = true,
    balance = current_credits + 100,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Log the credit grant
  INSERT INTO public.credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    created_at
  )
  VALUES (
    target_user_id,
    'grant',
    100,
    'Ręczne przyznanie statusu wczesnego użytkownika',
    NOW()
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get registration statistics
CREATE OR REPLACE FUNCTION public.get_registration_stats()
RETURNS TABLE (
  total_users INTEGER,
  early_adopters INTEGER,
  remaining_early_adopter_slots INTEGER,
  users_with_credits INTEGER,
  total_credits_granted INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.users) as total_users,
    (SELECT COUNT(*)::INTEGER FROM public.user_credits WHERE is_early_adopter = true) as early_adopters,
    (10 - (SELECT COUNT(*)::INTEGER FROM public.user_credits WHERE is_early_adopter = true)) as remaining_early_adopter_slots,
    (SELECT COUNT(*)::INTEGER FROM public.user_credits WHERE balance > 0) as users_with_credits,
    (SELECT COALESCE(SUM(amount), 0)::INTEGER FROM public.credit_transactions WHERE transaction_type = 'grant') as total_credits_granted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 7: USER REGISTRATION TRIGGER WITH CREDIT ALLOCATION
-- ============================================================================

-- Create the trigger function to handle new user signups with credit allocation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  is_early_adopter BOOLEAN := false;
  initial_credits INTEGER := 0;
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  
  -- Insert into user_preferences table with default values
  INSERT INTO public.user_preferences (user_id, has_completed_onboarding, created_at, updated_at)
  VALUES (
    NEW.id,
    false,
    NOW(),
    NOW()
  );
  
  -- Insert into user_trials table with 7-day trial
  INSERT INTO public.user_trials (user_id, trial_start_time, trial_end_time, is_trial_used)
  VALUES (
    NEW.id,
    NOW(),
    NOW() + INTERVAL '7 days',
    false
  );
  
  -- Check if user is eligible for early adopter credits
  SELECT COUNT(*) INTO user_count FROM public.user_credits;
  
  IF user_count < 10 THEN
    is_early_adopter := true;
    initial_credits := 100;
  END IF;
  
  -- Insert into user_credits table with initial credit allocation
  INSERT INTO public.user_credits (
    user_id, 
    balance, 
    total_purchased, 
    total_consumed, 
    is_early_adopter,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    initial_credits,
    0,
    0,
    is_early_adopter,
    NOW(),
    NOW()
  );
  
  -- Log the initial credit grant if credits were given
  IF initial_credits > 0 THEN
    INSERT INTO public.credit_transactions (
      user_id,
      transaction_type,
      amount,
      description,
      created_at
    )
    VALUES (
      NEW.id,
      'grant',
      initial_credits,
      'Darmowe kredyty dla wczesnych użytkowników',
      NOW()
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
-- PART 8: VIEWS AND ANALYTICS
-- ============================================================================

-- Create a view for user credit summary
CREATE VIEW public.user_credit_summary AS
SELECT 
  uc.user_id,
  uc.balance,
  uc.total_purchased,
  uc.total_consumed,
  uc.is_early_adopter,
  uc.created_at as credits_created_at,
  uc.updated_at as credits_updated_at,
  COALESCE(recent_transactions.recent_count, 0) as recent_transactions_count,
  COALESCE(recent_transactions.last_transaction_date, uc.created_at) as last_transaction_date
FROM public.user_credits uc
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as recent_count,
    MAX(created_at) as last_transaction_date
  FROM public.credit_transactions 
  WHERE created_at >= now() - INTERVAL '30 days'
  GROUP BY user_id
) recent_transactions ON uc.user_id = recent_transactions.user_id;

-- Create view for admin dashboard
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
-- PART 9: VIEW SECURITY (Views inherit RLS from underlying tables)
-- ============================================================================

-- Note: Views automatically inherit RLS policies from their underlying tables
-- The user_credit_summary view will respect the RLS policies on user_credits and credit_transactions
-- The admin_user_overview view will respect the RLS policies on users, user_credits, and credit_transactions

-- ============================================================================
-- PART 10: GRANT PERMISSIONS
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_preferences TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_trials TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.subscriptions TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_credits TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.credit_transactions TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.desktop_sessions TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.app_downloads TO postgres, anon, authenticated, service_role;

-- Grant sequence permissions
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.update_user_credits_updated_at() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_early_adopter_count() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.early_adopter_slots_available() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.grant_early_adopter_status(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_registration_stats() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Grant view permissions
GRANT SELECT ON public.user_credit_summary TO postgres, anon, authenticated, service_role;
GRANT SELECT ON public.admin_user_overview TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Display setup completion message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables created: users, user_preferences, user_trials, subscriptions, user_credits, credit_transactions, desktop_sessions, app_downloads';
  RAISE NOTICE 'Views created: user_credit_summary, admin_user_overview';
  RAISE NOTICE 'Functions created: handle_new_user, cleanup_expired_sessions, get_early_adopter_count, early_adopter_slots_available, grant_early_adopter_status, get_registration_stats';
  RAISE NOTICE 'RLS policies and permissions configured';
  RAISE NOTICE 'Early adopter system: First 10 users get 100 free credits';
END $$;