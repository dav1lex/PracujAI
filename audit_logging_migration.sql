-- ============================================================================
-- AUDIT LOGGING AND SECURITY MONITORING DATABASE MIGRATION
-- Run this AFTER the complete_database_setup_final.sql
-- This adds comprehensive audit logging and security monitoring capabilities
-- ============================================================================

-- ============================================================================
-- PART 1: ADD ADMIN COLUMN TO EXISTING USER_CREDITS TABLE
-- ============================================================================

-- Add is_admin column to user_credits table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credits' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.user_credits ADD COLUMN is_admin boolean DEFAULT false;
    RAISE NOTICE 'Added is_admin column to user_credits table';
  ELSE
    RAISE NOTICE 'is_admin column already exists in user_credits table';
  END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE AUDIT LOGGING TABLES
-- ============================================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  ip_address inet,
  user_agent text,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON public.audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON public.audit_logs(ip_address);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  metadata jsonb DEFAULT '{}',
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for security_alerts
CREATE INDEX IF NOT EXISTS idx_security_alerts_alert_type ON public.security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON public.security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);

-- Create system_metrics table for performance monitoring
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  unit text,
  tags jsonb DEFAULT '{}',
  recorded_at timestamp with time zone DEFAULT now()
);

-- Create indexes for system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);

-- Create database_query_logs table for query performance monitoring
CREATE TABLE IF NOT EXISTS public.database_query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  query_text text,
  execution_time_ms numeric NOT NULL,
  rows_affected integer,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for database_query_logs
CREATE INDEX IF NOT EXISTS idx_db_query_logs_hash ON public.database_query_logs(query_hash);
CREATE INDEX IF NOT EXISTS idx_db_query_logs_execution_time ON public.database_query_logs(execution_time_ms DESC);
CREATE INDEX IF NOT EXISTS idx_db_query_logs_created_at ON public.database_query_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_db_query_logs_endpoint ON public.database_query_logs(endpoint);

-- Create backup_logs table for backup monitoring
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  file_path text,
  file_size_bytes bigint,
  duration_seconds integer,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for backup_logs
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON public.backup_logs(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON public.backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);

-- ============================================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: CREATE RLS POLICIES
-- ============================================================================

-- Create RLS policies for audit_logs (admin only)
CREATE POLICY "Admin can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_credits 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for security_alerts (admin only)
CREATE POLICY "Admin can view all security alerts" ON public.security_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_credits 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin can update security alerts" ON public.security_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_credits 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert security alerts" ON public.security_alerts
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for system_metrics (admin only)
CREATE POLICY "Admin can view system metrics" ON public.system_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_credits 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert metrics" ON public.system_metrics
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for database_query_logs (admin only)
CREATE POLICY "Admin can view query logs" ON public.database_query_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_credits 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert query logs" ON public.database_query_logs
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for backup_logs (admin only)
CREATE POLICY "Admin can view backup logs" ON public.backup_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_credits 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert backup logs" ON public.backup_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PART 5: CREATE AUDIT AND MONITORING FUNCTIONS
-- ============================================================================

-- Create function to clean up old audit logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 1 year
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Delete resolved security alerts older than 6 months
  DELETE FROM public.security_alerts 
  WHERE resolved = true AND resolved_at < NOW() - INTERVAL '6 months';
  
  -- Delete system metrics older than 3 months
  DELETE FROM public.system_metrics 
  WHERE recorded_at < NOW() - INTERVAL '3 months';
  
  -- Delete query logs older than 1 month
  DELETE FROM public.database_query_logs 
  WHERE created_at < NOW() - INTERVAL '1 month';
  
  -- Delete backup logs older than 1 year
  DELETE FROM public.backup_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  RAISE NOTICE 'Cleaned up old audit logs and monitoring data';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get system health metrics
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_users integer;
  active_sessions integer;
  failed_logins_24h integer;
  high_risk_alerts integer;
  avg_response_time numeric;
BEGIN
  -- Get total users
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  -- Get active desktop sessions
  SELECT COUNT(*) INTO active_sessions 
  FROM public.desktop_sessions 
  WHERE expires_at > NOW();
  
  -- Get failed logins in last 24 hours
  SELECT COUNT(*) INTO failed_logins_24h 
  FROM public.audit_logs 
  WHERE event_type = 'user_login' 
    AND created_at > NOW() - INTERVAL '24 hours'
    AND (metadata->>'success')::boolean = false;
  
  -- Get unresolved high-risk security alerts
  SELECT COUNT(*) INTO high_risk_alerts 
  FROM public.security_alerts 
  WHERE severity IN ('high', 'critical') 
    AND resolved = false;
  
  -- Get average query response time in last hour
  SELECT AVG(execution_time_ms) INTO avg_response_time 
  FROM public.database_query_logs 
  WHERE created_at > NOW() - INTERVAL '1 hour';
  
  -- Build result JSON
  result := jsonb_build_object(
    'total_users', total_users,
    'active_sessions', active_sessions,
    'failed_logins_24h', failed_logins_24h,
    'high_risk_alerts', high_risk_alerts,
    'avg_response_time_ms', COALESCE(avg_response_time, 0),
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to make a user admin (for initial setup)
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS boolean AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Find user by email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RAISE NOTICE 'User with email % not found', user_email;
    RETURN false;
  END IF;
  
  -- Update user_credits to make them admin
  UPDATE public.user_credits 
  SET is_admin = true 
  WHERE user_id = user_uuid;
  
  -- If no user_credits record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, balance, total_purchased, total_consumed, is_early_adopter, is_admin)
    VALUES (user_uuid, 0, 0, 0, false, true);
  END IF;
  
  RAISE NOTICE 'User % has been made an admin', user_email;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: GRANT PERMISSIONS
-- ============================================================================

-- Grant table permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated, service_role;
GRANT INSERT ON public.security_alerts TO authenticated, service_role;
GRANT INSERT ON public.system_metrics TO authenticated, service_role;
GRANT INSERT ON public.database_query_logs TO authenticated, service_role;
GRANT INSERT ON public.backup_logs TO authenticated, service_role;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs() TO service_role;
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION make_user_admin(text) TO service_role;

-- ============================================================================
-- PART 7: ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit log for all system events';
COMMENT ON TABLE public.security_alerts IS 'Security alerts and incidents tracking';
COMMENT ON TABLE public.system_metrics IS 'System performance and health metrics';
COMMENT ON TABLE public.database_query_logs IS 'Database query performance monitoring';
COMMENT ON TABLE public.backup_logs IS 'Backup operations tracking and monitoring';

COMMENT ON FUNCTION cleanup_old_audit_logs() IS 'Cleans up old audit logs and monitoring data based on retention policies';
COMMENT ON FUNCTION get_system_health() IS 'Returns current system health metrics as JSON';
COMMENT ON FUNCTION make_user_admin(text) IS 'Makes a user admin by email address (for initial setup)';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'AUDIT LOGGING AND SECURITY MONITORING SETUP COMPLETED!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tables created: 5';
  RAISE NOTICE '  - audit_logs (comprehensive event logging)';
  RAISE NOTICE '  - security_alerts (security incident tracking)';
  RAISE NOTICE '  - system_metrics (performance monitoring)';
  RAISE NOTICE '  - database_query_logs (query performance tracking)';
  RAISE NOTICE '  - backup_logs (backup operation tracking)';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created: 3';
  RAISE NOTICE '  - cleanup_old_audit_logs() (data retention)';
  RAISE NOTICE '  - get_system_health() (health monitoring)';
  RAISE NOTICE '  - make_user_admin(email) (admin user setup)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  - Row Level Security (RLS) on all audit tables';
  RAISE NOTICE '  - Admin-only access to audit data';
  RAISE NOTICE '  - Comprehensive event logging system';
  RAISE NOTICE '  - Security monitoring and alerting';
  RAISE NOTICE '  - Performance metrics tracking';
  RAISE NOTICE '  - Automated data retention policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Make your first admin user: SELECT make_user_admin(''your-email@example.com'');';
  RAISE NOTICE '  2. Test the monitoring endpoints in your application';
  RAISE NOTICE '  3. Set up automated cleanup: schedule cleanup_old_audit_logs()';
  RAISE NOTICE '';
  RAISE NOTICE 'Your audit logging and security monitoring system is now ready!';
  RAISE NOTICE '============================================================================';
END $$;