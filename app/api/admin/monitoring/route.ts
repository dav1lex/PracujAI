import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSecureAPIRoute, createSuccessResponse, createErrorResponse } from '@/utils/api-security';
import { AuditLogger } from '@/utils/audit-logger';
import { SystemMonitor } from '@/utils/system-monitor';
import { BackupSystem } from '@/utils/backup-system';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = createSecureAPIRoute(
  async (request: NextRequest, context) => {
    try {
      // Check if user is admin
      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('is_admin')
        .eq('user_id', context.user!.id)
        .single();

      if (creditsError || !userCredits?.is_admin) {
        return createErrorResponse(
          'Brak uprawnień administratora',
          'ADMIN_ACCESS_REQUIRED',
          403
        );
      }

      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type') || 'overview';

      let data: any = {};

      switch (type) {
        case 'overview':
          // Get system health and basic stats
          const systemHealth = await SystemMonitor.getSystemHealth();
          const backupStats = await BackupSystem.getBackupStatistics();
          const recentAlerts = await AuditLogger.getSecurityAlerts({ 
            resolved: false, 
            limit: 10 
          });

          data = {
            system_health: systemHealth,
            backup_statistics: backupStats,
            unresolved_alerts: recentAlerts.length,
            recent_alerts: recentAlerts
          };
          break;

        case 'audit_logs':
          const limit = parseInt(searchParams.get('limit') || '50');
          const offset = parseInt(searchParams.get('offset') || '0');
          const eventType = searchParams.get('event_type') || undefined;
          const riskLevel = searchParams.get('risk_level') || undefined;
          const startDate = searchParams.get('start_date') || undefined;
          const endDate = searchParams.get('end_date') || undefined;

          const auditLogs = await AuditLogger.getLogs({
            eventType: eventType as any,
            riskLevel: riskLevel as any,
            startDate,
            endDate,
            limit,
            offset
          });

          data = {
            logs: auditLogs,
            total: auditLogs.length,
            limit,
            offset
          };
          break;

        case 'security_alerts':
          const alertLimit = parseInt(searchParams.get('limit') || '50');
          const severity = searchParams.get('severity') || undefined;
          const resolved = searchParams.get('resolved') === 'true' ? true : 
                          searchParams.get('resolved') === 'false' ? false : undefined;

          const securityAlerts = await AuditLogger.getSecurityAlerts({
            severity: severity as any,
            resolved,
            limit: alertLimit
          });

          data = {
            alerts: securityAlerts,
            total: securityAlerts.length
          };
          break;

        case 'metrics':
          const metricName = searchParams.get('metric_name');
          const metricType = searchParams.get('metric_type');
          const metricsLimit = parseInt(searchParams.get('limit') || '100');
          const metricsStartDate = searchParams.get('start_date');
          const metricsEndDate = searchParams.get('end_date');

          const metrics = await SystemMonitor.getMetrics({
            metricName: metricName || undefined,
            metricType: metricType as any,
            startDate: metricsStartDate || undefined,
            endDate: metricsEndDate || undefined,
            limit: metricsLimit
          });

          data = {
            metrics,
            total: metrics.length
          };
          break;

        case 'backup_history':
          const backupLimit = parseInt(searchParams.get('limit') || '50');
          const backupHistory = await BackupSystem.getBackupHistory(backupLimit);

          data = {
            backups: backupHistory,
            total: backupHistory.length
          };
          break;

        default:
          return createErrorResponse(
            'Nieprawidłowy typ monitorowania',
            'INVALID_MONITORING_TYPE',
            400
          );
      }

      return createSuccessResponse(data);

    } catch (error) {
      console.error('Error in admin monitoring:', error);
      return createErrorResponse(
        'Błąd podczas pobierania danych monitorowania',
        'MONITORING_ERROR',
        500
      );
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 15 * 60 * 1000 } // 100 requests per 15 minutes
  }
);

export const POST = createSecureAPIRoute(
  async (request: NextRequest, context) => {
    try {
      // Check if user is admin
      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('is_admin')
        .eq('user_id', context.user!.id)
        .single();

      if (creditsError || !userCredits?.is_admin) {
        return createErrorResponse(
          'Brak uprawnień administratora',
          'ADMIN_ACCESS_REQUIRED',
          403
        );
      }

      const { action, ...params } = context.validatedData!;

      let result: any = {};

      switch (action) {
        case 'create_backup':
          const backupType = params.backup_type || 'full';
          const backupResult = await BackupSystem.createBackup({
            type: backupType,
            ...params
          });
          result = { backup: backupResult };
          break;

        case 'resolve_alert':
          const alertId = params.alert_id;
          if (!alertId) {
            return createErrorResponse(
              'ID alertu jest wymagane',
              'ALERT_ID_REQUIRED',
              400
            );
          }

          const resolved = await AuditLogger.resolveAlert(alertId, context.user!.id);
          result = { resolved };
          break;

        case 'cleanup_old_data':
          await SystemMonitor.cleanupOldMetrics();
          await BackupSystem.cleanupOldBackups();
          result = { cleaned: true };
          break;

        case 'verify_backup':
          const backupId = params.backup_id;
          if (!backupId) {
            return createErrorResponse(
              'ID kopii zapasowej jest wymagane',
              'BACKUP_ID_REQUIRED',
              400
            );
          }

          const isValid = await BackupSystem.verifyBackup(backupId);
          result = { valid: isValid };
          break;

        default:
          return createErrorResponse(
            'Nieprawidłowa akcja',
            'INVALID_ACTION',
            400
          );
      }

      return createSuccessResponse(result);

    } catch (error) {
      console.error('Error in admin monitoring action:', error);
      return createErrorResponse(
        'Błąd podczas wykonywania akcji',
        'ACTION_ERROR',
        500
      );
    }
  },
  {
    requireAuth: true,
    requireCSRF: true,
    validation: {
      action: {
        type: 'string',
        required: true,
        enum: ['create_backup', 'resolve_alert', 'cleanup_old_data', 'verify_backup']
      },
      backup_type: {
        type: 'string',
        required: false,
        enum: ['full', 'incremental', 'differential']
      },
      alert_id: {
        type: 'uuid',
        required: false
      },
      backup_id: {
        type: 'uuid',
        required: false
      }
    },
    rateLimit: { requests: 20, windowMs: 15 * 60 * 1000 } // 20 requests per 15 minutes
  }
);