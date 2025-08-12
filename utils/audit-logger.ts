/**
 * Comprehensive audit logging and monitoring system
 * @file utils/audit-logger.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Audit event types
export enum AuditEventType {
  // Authentication events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_CHANGE = 'email_change',
  ACCOUNT_DELETE = 'account_delete',
  
  // Desktop app events
  DESKTOP_AUTH = 'desktop_auth',
  DESKTOP_SESSION_CREATE = 'desktop_session_create',
  DESKTOP_SESSION_EXPIRE = 'desktop_session_expire',
  API_KEY_GENERATE = 'api_key_generate',
  
  // Credit events
  CREDITS_PURCHASE = 'credits_purchase',
  CREDITS_CONSUME = 'credits_consume',
  CREDITS_GRANT = 'credits_grant',
  CREDITS_REFUND = 'credits_refund',
  
  // Payment events
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUND = 'payment_refund',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_TOKEN = 'invalid_token',
  CSRF_VIOLATION = 'csrf_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  
  // System events
  ERROR_OCCURRED = 'error_occurred',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  
  // Admin events
  ADMIN_LOGIN = 'admin_login',
  ADMIN_USER_VIEW = 'admin_user_view',
  ADMIN_CREDIT_ADJUST = 'admin_credit_adjust',
  ADMIN_SUPPORT_ACTION = 'admin_support_action'
}

// Risk levels for events
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Audit log entry interface
export interface AuditLogEntry {
  id?: string;
  event_type: AuditEventType;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  risk_level: RiskLevel;
  description: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

// Security alert interface
export interface SecurityAlert {
  id?: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  user_id?: string;
  ip_address?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at?: string;
}

export class AuditLogger {
  // Log an audit event
  static async log(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          ...entry,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log audit event:', error);
        // Fallback to console logging
        console.log('AUDIT LOG:', JSON.stringify(entry, null, 2));
      }

      // Check if this event should trigger a security alert
      await this.checkForSecurityAlerts(entry);

    } catch (error) {
      console.error('Audit logging error:', error);
      // Fallback to console logging
      console.log('AUDIT LOG (FALLBACK):', JSON.stringify(entry, null, 2));
    }
  }

  // Log authentication events
  static async logAuth(
    eventType: AuditEventType,
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const riskLevel = this.determineAuthRiskLevel(eventType, metadata);
    
    await this.log({
      event_type: eventType,
      user_id: userId,
      session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      risk_level: riskLevel,
      description: this.getEventDescription(eventType, metadata),
      metadata
    });
  }

  // Log credit events
  static async logCredit(
    eventType: AuditEventType,
    userId: string,
    amount: number,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      user_id: userId,
      risk_level: RiskLevel.LOW,
      description: description || `${eventType}: ${amount} kredytów`,
      metadata: {
        amount,
        ...metadata
      }
    });
  }

  // Log payment events
  static async logPayment(
    eventType: AuditEventType,
    userId: string,
    amount: number,
    paymentIntentId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const riskLevel = eventType === AuditEventType.PAYMENT_FAILED ? RiskLevel.MEDIUM : RiskLevel.LOW;
    
    await this.log({
      event_type: eventType,
      user_id: userId,
      risk_level: riskLevel,
      description: `${eventType}: ${amount} PLN`,
      metadata: {
        amount,
        payment_intent_id: paymentIntentId,
        ...metadata
      }
    });
  }

  // Log security events
  static async logSecurity(
    eventType: AuditEventType,
    ipAddress?: string,
    userAgent?: string,
    userId?: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const riskLevel = this.determineSecurityRiskLevel(eventType);
    
    await this.log({
      event_type: eventType,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      risk_level: riskLevel,
      description: description || this.getEventDescription(eventType, metadata),
      metadata
    });
  }

  // Log system errors
  static async logError(
    error: Error,
    context?: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.ERROR_OCCURRED,
      user_id: userId,
      risk_level: RiskLevel.MEDIUM,
      description: `Error in ${context || 'unknown'}: ${error.message}`,
      metadata: {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        context,
        ...metadata
      }
    });
  }

  // Check for security alerts based on audit events
  private static async checkForSecurityAlerts(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<void> {
    try {
      // Check for multiple failed login attempts
      if (entry.event_type === AuditEventType.USER_LOGIN && entry.metadata?.success === false) {
        await this.checkFailedLoginAttempts(entry.ip_address, entry.user_id);
      }

      // Check for rate limit violations
      if (entry.event_type === AuditEventType.RATE_LIMIT_EXCEEDED) {
        await this.createSecurityAlert({
          alert_type: 'rate_limit_violation',
          severity: 'medium',
          title: 'Przekroczenie limitu żądań',
          description: `Adres IP ${entry.ip_address} przekroczył limit żądań`,
          ip_address: entry.ip_address,
          user_id: entry.user_id,
          metadata: entry.metadata,
          resolved: false
        });
      }

      // Check for CSRF violations
      if (entry.event_type === AuditEventType.CSRF_VIOLATION) {
        await this.createSecurityAlert({
          alert_type: 'csrf_violation',
          severity: 'high',
          title: 'Naruszenie ochrony CSRF',
          description: `Wykryto potencjalny atak CSRF z adresu ${entry.ip_address}`,
          ip_address: entry.ip_address,
          user_id: entry.user_id,
          metadata: entry.metadata,
          resolved: false
        });
      }

      // Check for suspicious payment activity
      if (entry.event_type === AuditEventType.PAYMENT_FAILED && entry.metadata?.amount > 1000) {
        await this.checkSuspiciousPaymentActivity(entry.user_id, entry.ip_address);
      }

    } catch (error) {
      console.error('Error checking security alerts:', error);
    }
  }

  // Check for multiple failed login attempts
  private static async checkFailedLoginAttempts(ipAddress?: string, userId?: string): Promise<void> {
    if (!ipAddress && !userId) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', AuditEventType.USER_LOGIN)
      .gte('created_at', oneHourAgo);

    if (ipAddress) {
      query = query.eq('ip_address', ipAddress);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: failedAttempts, error } = await query;

    if (error) {
      console.error('Error checking failed login attempts:', error);
      return;
    }

    const failedCount = failedAttempts?.filter(log => log.metadata?.success === false).length || 0;

    if (failedCount >= 5) {
      await this.createSecurityAlert({
        alert_type: 'multiple_failed_logins',
        severity: failedCount >= 10 ? 'high' : 'medium',
        title: 'Wielokrotne nieudane próby logowania',
        description: `Wykryto ${failedCount} nieudanych prób logowania w ciągu ostatniej godziny`,
        ip_address: ipAddress,
        user_id: userId,
        metadata: { failed_attempts: failedCount },
        resolved: false
      });
    }
  }

  // Check for suspicious payment activity
  private static async checkSuspiciousPaymentActivity(userId?: string, ipAddress?: string): Promise<void> {
    if (!userId) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: paymentAttempts, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .in('event_type', [AuditEventType.PAYMENT_FAILED, AuditEventType.PAYMENT_SUCCESS])
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Error checking payment activity:', error);
      return;
    }

    const failedPayments = paymentAttempts?.filter(log => 
      log.event_type === AuditEventType.PAYMENT_FAILED
    ).length || 0;

    if (failedPayments >= 3) {
      await this.createSecurityAlert({
        alert_type: 'suspicious_payment_activity',
        severity: 'high',
        title: 'Podejrzana aktywność płatnicza',
        description: `Użytkownik ${userId} miał ${failedPayments} nieudanych płatności w ciągu ostatniej godziny`,
        ip_address: ipAddress,
        user_id: userId,
        metadata: { failed_payments: failedPayments },
        resolved: false
      });
    }
  }

  // Create a security alert
  private static async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .insert({
          ...alert,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to create security alert:', error);
      }

      // In production, you might want to send notifications here
      // e.g., email alerts, Slack notifications, etc.
      console.warn('SECURITY ALERT:', alert.title, alert.description);

    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  // Determine risk level for authentication events
  private static determineAuthRiskLevel(eventType: AuditEventType, metadata?: Record<string, any>): RiskLevel {
    switch (eventType) {
      case AuditEventType.USER_LOGIN:
        return metadata?.success === false ? RiskLevel.MEDIUM : RiskLevel.LOW;
      case AuditEventType.PASSWORD_CHANGE:
      case AuditEventType.EMAIL_CHANGE:
        return RiskLevel.MEDIUM;
      case AuditEventType.ACCOUNT_DELETE:
        return RiskLevel.HIGH;
      default:
        return RiskLevel.LOW;
    }
  }

  // Determine risk level for security events
  private static determineSecurityRiskLevel(eventType: AuditEventType): RiskLevel {
    switch (eventType) {
      case AuditEventType.RATE_LIMIT_EXCEEDED:
        return RiskLevel.MEDIUM;
      case AuditEventType.CSRF_VIOLATION:
      case AuditEventType.SUSPICIOUS_ACTIVITY:
        return RiskLevel.HIGH;
      case AuditEventType.INVALID_TOKEN:
        return RiskLevel.MEDIUM;
      default:
        return RiskLevel.LOW;
    }
  }

  // Get human-readable description for event types
  private static getEventDescription(eventType: AuditEventType, metadata?: Record<string, any>): string {
    const descriptions: Record<AuditEventType, string> = {
      [AuditEventType.USER_LOGIN]: metadata?.success ? 'Użytkownik zalogował się' : 'Nieudana próba logowania',
      [AuditEventType.USER_LOGOUT]: 'Użytkownik wylogował się',
      [AuditEventType.USER_REGISTER]: 'Nowy użytkownik zarejestrował się',
      [AuditEventType.PASSWORD_CHANGE]: 'Użytkownik zmienił hasło',
      [AuditEventType.EMAIL_CHANGE]: 'Użytkownik zmienił adres e-mail',
      [AuditEventType.ACCOUNT_DELETE]: 'Użytkownik usunął konto',
      [AuditEventType.DESKTOP_AUTH]: 'Uwierzytelnienie aplikacji desktopowej',
      [AuditEventType.DESKTOP_SESSION_CREATE]: 'Utworzono sesję aplikacji desktopowej',
      [AuditEventType.DESKTOP_SESSION_EXPIRE]: 'Sesja aplikacji desktopowej wygasła',
      [AuditEventType.API_KEY_GENERATE]: 'Wygenerowano klucz API',
      [AuditEventType.CREDITS_PURCHASE]: 'Zakup kredytów',
      [AuditEventType.CREDITS_CONSUME]: 'Wykorzystanie kredytów',
      [AuditEventType.CREDITS_GRANT]: 'Przyznanie kredytów',
      [AuditEventType.CREDITS_REFUND]: 'Zwrot kredytów',
      [AuditEventType.PAYMENT_INITIATED]: 'Rozpoczęcie płatności',
      [AuditEventType.PAYMENT_SUCCESS]: 'Płatność zakończona sukcesem',
      [AuditEventType.PAYMENT_FAILED]: 'Płatność nieudana',
      [AuditEventType.PAYMENT_REFUND]: 'Zwrot płatności',
      [AuditEventType.RATE_LIMIT_EXCEEDED]: 'Przekroczenie limitu żądań',
      [AuditEventType.INVALID_TOKEN]: 'Nieprawidłowy token',
      [AuditEventType.CSRF_VIOLATION]: 'Naruszenie ochrony CSRF',
      [AuditEventType.SUSPICIOUS_ACTIVITY]: 'Podejrzana aktywność',
      [AuditEventType.ERROR_OCCURRED]: 'Wystąpił błąd systemu',
      [AuditEventType.SYSTEM_BACKUP]: 'Kopia zapasowa systemu',
      [AuditEventType.SYSTEM_MAINTENANCE]: 'Konserwacja systemu',
      [AuditEventType.ADMIN_LOGIN]: 'Administrator zalogował się',
      [AuditEventType.ADMIN_USER_VIEW]: 'Administrator przeglądał dane użytkownika',
      [AuditEventType.ADMIN_CREDIT_ADJUST]: 'Administrator dostosował kredyty',
      [AuditEventType.ADMIN_SUPPORT_ACTION]: 'Administrator wykonał akcję wsparcia'
    };

    return descriptions[eventType] || 'Nieznane zdarzenie';
  }

  // Get audit logs with filtering
  static async getLogs(filters: {
    userId?: string;
    eventType?: AuditEventType;
    riskLevel?: RiskLevel;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error in getLogs:', error);
      return [];
    }
  }

  // Get security alerts
  static async getSecurityAlerts(filters: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resolved?: boolean;
    limit?: number;
  } = {}): Promise<SecurityAlert[]> {
    try {
      let query = supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching security alerts:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error in getSecurityAlerts:', error);
      return [];
    }
  }

  // Resolve security alert
  static async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error resolving security alert:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error in resolveAlert:', error);
      return false;
    }
  }
}