/**
 * System monitoring and performance tracking utilities
 * @file utils/system-monitor.ts
 */

import { createClient } from '@supabase/supabase-js';
import { AuditLogger, AuditEventType } from './audit-logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// System metric types
export enum MetricType {
  PERFORMANCE = 'performance',
  USAGE = 'usage',
  ERROR = 'error',
  SECURITY = 'security',
  BUSINESS = 'business'
}

// Metric interface
export interface SystemMetric {
  metric_type: MetricType;
  metric_name: string;
  metric_value: number;
  unit?: string;
  tags?: Record<string, any>;
}

// Query performance tracking
export interface QueryPerformance {
  query_hash: string;
  query_text?: string;
  execution_time_ms: number;
  rows_affected?: number;
  user_id?: string;
  endpoint?: string;
}

// System health status
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  total_users: number;
  active_sessions: number;
  failed_logins_24h: number;
  high_risk_alerts: number;
  avg_response_time_ms: number;
  timestamp: string;
}

export class SystemMonitor {
  // Record a system metric
  static async recordMetric(metric: SystemMetric): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_metrics')
        .insert({
          ...metric,
          recorded_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to record system metric:', error);
      }
    } catch (error) {
      console.error('Error recording system metric:', error);
    }
  }

  // Record query performance
  static async recordQueryPerformance(query: QueryPerformance): Promise<void> {
    try {
      const { error } = await supabase
        .from('database_query_logs')
        .insert({
          ...query,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to record query performance:', error);
      }

      // Alert on slow queries (>1000ms)
      if (query.execution_time_ms > 1000) {
        await AuditLogger.log({
          event_type: AuditEventType.ERROR_OCCURRED,
          user_id: query.user_id,
          risk_level: 'medium' as any,
          description: `Slow query detected: ${query.execution_time_ms}ms`,
          metadata: {
            query_hash: query.query_hash,
            execution_time: query.execution_time_ms,
            endpoint: query.endpoint
          }
        });
      }
    } catch (error) {
      console.error('Error recording query performance:', error);
    }
  }

  // Get system health status
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const { data, error } = await supabase.rpc('get_system_health');

      if (error) {
        console.error('Error getting system health:', error);
        return {
          status: 'critical',
          total_users: 0,
          active_sessions: 0,
          failed_logins_24h: 0,
          high_risk_alerts: 0,
          avg_response_time_ms: 0,
          timestamp: new Date().toISOString()
        };
      }

      const health = data as SystemHealth;
      
      // Determine overall health status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (health.high_risk_alerts > 0 || health.avg_response_time_ms > 2000) {
        status = 'critical';
      } else if (health.failed_logins_24h > 50 || health.avg_response_time_ms > 1000) {
        status = 'warning';
      }

      return {
        ...health,
        status
      };
    } catch (error) {
      console.error('Error in getSystemHealth:', error);
      return {
        status: 'critical',
        total_users: 0,
        active_sessions: 0,
        failed_logins_24h: 0,
        high_risk_alerts: 0,
        avg_response_time_ms: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Record API endpoint performance
  static async recordAPIPerformance(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string
  ): Promise<void> {
    // Record as system metric
    await this.recordMetric({
      metric_type: MetricType.PERFORMANCE,
      metric_name: 'api_response_time',
      metric_value: responseTime,
      unit: 'ms',
      tags: {
        endpoint,
        method,
        status_code: statusCode,
        user_id: userId
      }
    });

    // Record API usage
    await this.recordMetric({
      metric_type: MetricType.USAGE,
      metric_name: 'api_requests',
      metric_value: 1,
      unit: 'count',
      tags: {
        endpoint,
        method,
        status_code: statusCode
      }
    });

    // Alert on errors
    if (statusCode >= 500) {
      await AuditLogger.log({
        event_type: AuditEventType.ERROR_OCCURRED,
        user_id: userId,
        risk_level: 'high' as any,
        description: `API error: ${method} ${endpoint} returned ${statusCode}`,
        metadata: {
          endpoint,
          method,
          status_code: statusCode,
          response_time: responseTime
        }
      });
    }
  }

  // Record user activity metrics
  static async recordUserActivity(
    activityType: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.recordMetric({
      metric_type: MetricType.USAGE,
      metric_name: 'user_activity',
      metric_value: 1,
      unit: 'count',
      tags: {
        activity_type: activityType,
        user_id: userId,
        ...metadata
      }
    });
  }

  // Record business metrics
  static async recordBusinessMetric(
    metricName: string,
    value: number,
    unit?: string,
    tags?: Record<string, any>
  ): Promise<void> {
    await this.recordMetric({
      metric_type: MetricType.BUSINESS,
      metric_name: metricName,
      metric_value: value,
      unit,
      tags
    });
  }

  // Get metrics with filtering
  static async getMetrics(filters: {
    metricType?: MetricType;
    metricName?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<SystemMetric[]> {
    try {
      let query = supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (filters.metricType) {
        query = query.eq('metric_type', filters.metricType);
      }

      if (filters.metricName) {
        query = query.eq('metric_name', filters.metricName);
      }

      if (filters.startDate) {
        query = query.gte('recorded_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('recorded_at', filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching metrics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMetrics:', error);
      return [];
    }
  }

  // Get aggregated metrics
  static async getAggregatedMetrics(
    metricName: string,
    aggregation: 'avg' | 'sum' | 'count' | 'min' | 'max',
    groupBy: 'hour' | 'day' | 'week' | 'month',
    startDate?: string,
    endDate?: string
  ): Promise<Array<{ period: string; value: number }>> {
    try {
      // This would typically use a more sophisticated query
      // For now, we'll do basic aggregation
      let query = supabase
        .from('system_metrics')
        .select('metric_value, recorded_at')
        .eq('metric_name', metricName)
        .order('recorded_at', { ascending: true });

      if (startDate) {
        query = query.gte('recorded_at', startDate);
      }

      if (endDate) {
        query = query.lte('recorded_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching aggregated metrics:', error);
        return [];
      }

      // Simple client-side aggregation (in production, use database functions)
      const grouped = new Map<string, number[]>();
      
      data?.forEach(metric => {
        const date = new Date(metric.recorded_at);
        let period: string;
        
        switch (groupBy) {
          case 'hour':
            period = date.toISOString().substring(0, 13) + ':00:00Z';
            break;
          case 'day':
            period = date.toISOString().substring(0, 10);
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            period = weekStart.toISOString().substring(0, 10);
            break;
          case 'month':
            period = date.toISOString().substring(0, 7);
            break;
        }
        
        if (!grouped.has(period)) {
          grouped.set(period, []);
        }
        grouped.get(period)!.push(metric.metric_value);
      });

      // Apply aggregation
      const result: Array<{ period: string; value: number }> = [];
      
      for (const [period, values] of grouped.entries()) {
        let value: number;
        
        switch (aggregation) {
          case 'avg':
            value = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'sum':
            value = values.reduce((a, b) => a + b, 0);
            break;
          case 'count':
            value = values.length;
            break;
          case 'min':
            value = Math.min(...values);
            break;
          case 'max':
            value = Math.max(...values);
            break;
        }
        
        result.push({ period, value });
      }

      return result.sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
      console.error('Error in getAggregatedMetrics:', error);
      return [];
    }
  }

  // Clean up old metrics (retention policy)
  static async cleanupOldMetrics(): Promise<void> {
    try {
      await supabase.rpc('cleanup_old_audit_logs');
      
      await AuditLogger.log({
        event_type: AuditEventType.SYSTEM_MAINTENANCE,
        risk_level: 'low' as any,
        description: 'Cleaned up old audit logs and metrics'
      });
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
    }
  }

  // Start periodic monitoring (call this on app startup)
  static startPeriodicMonitoring(): void {
    // Record system health every 5 minutes
    setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        
        await this.recordMetric({
          metric_type: MetricType.PERFORMANCE,
          metric_name: 'system_health_score',
          metric_value: health.status === 'healthy' ? 100 : health.status === 'warning' ? 50 : 0,
          unit: 'score',
          tags: {
            status: health.status,
            total_users: health.total_users,
            active_sessions: health.active_sessions
          }
        });
      } catch (error) {
        console.error('Error in periodic health check:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Clean up old data daily
    setInterval(async () => {
      try {
        await this.cleanupOldMetrics();
      } catch (error) {
        console.error('Error in periodic cleanup:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}

// Performance monitoring middleware wrapper
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    let error: Error | null = null;
    
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      error = err as Error;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      
      // Record performance metric
      await SystemMonitor.recordMetric({
        metric_type: MetricType.PERFORMANCE,
        metric_name: 'function_execution_time',
        metric_value: duration,
        unit: 'ms',
        tags: {
          function_name: name,
          success: !error,
          error_type: error?.name
        }
      });
      
      // Log errors
      if (error) {
        await AuditLogger.logError(error, name);
      }
    }
  }) as T;
}