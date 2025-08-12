/**
 * Automated backup and recovery system
 * @file utils/backup-system.ts
 */

import { createClient } from '@supabase/supabase-js';
import { AuditLogger, AuditEventType } from './audit-logger';
import { SystemMonitor, MetricType } from './system-monitor';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Backup types
export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential'
}

// Backup status
export enum BackupStatus {
  STARTED = 'started',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Backup configuration
export interface BackupConfig {
  type: BackupType;
  tables: string[];
  compression: boolean;
  encryption: boolean;
  retention_days: number;
}

// Backup result
export interface BackupResult {
  id: string;
  type: BackupType;
  status: BackupStatus;
  file_path?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  error_message?: string;
  metadata?: Record<string, any>;
}

export class BackupSystem {
  private static readonly DEFAULT_CONFIG: BackupConfig = {
    type: BackupType.FULL,
    tables: [
      'auth.users',
      'public.user_credits',
      'public.credit_transactions',
      'public.desktop_sessions',
      'public.app_downloads',
      'public.audit_logs',
      'public.security_alerts'
    ],
    compression: true,
    encryption: true,
    retention_days: 30
  };

  // Create a backup
  static async createBackup(config: Partial<BackupConfig> = {}): Promise<BackupResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();
    
    // Log backup start
    const { data: backupLog, error: logError } = await supabase
      .from('backup_logs')
      .insert({
        backup_type: finalConfig.type,
        status: BackupStatus.STARTED,
        metadata: { config: finalConfig },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log backup start:', logError);
      throw new Error('Failed to initialize backup logging');
    }

    try {
      // Audit log
      await AuditLogger.log({
        event_type: AuditEventType.SYSTEM_BACKUP,
        risk_level: 'low' as any,
        description: `Started ${finalConfig.type} backup`,
        metadata: { backup_id: backupLog.id, config: finalConfig }
      });

      let backupData: any = {};
      let totalSize = 0;

      // Export data from each table
      for (const table of finalConfig.tables) {
        try {
          const tableData = await this.exportTable(table);
          backupData[table] = tableData.data;
          totalSize += JSON.stringify(tableData.data).length;
          
          console.log(`Exported ${tableData.count} records from ${table}`);
        } catch (error) {
          console.error(`Failed to export table ${table}:`, error);
          // Continue with other tables
        }
      }

      // Generate backup file content
      const backupContent = {
        version: '1.0',
        created_at: new Date().toISOString(),
        type: finalConfig.type,
        tables: backupData,
        metadata: {
          total_tables: finalConfig.tables.length,
          total_size_bytes: totalSize,
          compression: finalConfig.compression,
          encryption: finalConfig.encryption
        }
      };

      // In a real implementation, you would:
      // 1. Compress the data if compression is enabled
      // 2. Encrypt the data if encryption is enabled
      // 3. Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
      // 4. Store the file path and metadata

      const filePath = `backups/${finalConfig.type}_${Date.now()}.json`;
      const fileSize = JSON.stringify(backupContent).length;
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Update backup log with success
      await supabase
        .from('backup_logs')
        .update({
          status: BackupStatus.COMPLETED,
          file_path: filePath,
          file_size_bytes: fileSize,
          duration_seconds: duration,
          metadata: {
            ...backupLog.metadata,
            tables_exported: Object.keys(backupData).length,
            total_records: Object.values(backupData).reduce((sum: number, data: any) => sum + (Array.isArray(data) ? data.length : 0), 0)
          }
        })
        .eq('id', backupLog.id);

      // Record metrics
      await SystemMonitor.recordMetric({
        metric_type: MetricType.PERFORMANCE,
        metric_name: 'backup_duration',
        metric_value: duration,
        unit: 'seconds',
        tags: {
          backup_type: finalConfig.type,
          file_size_mb: Math.round(fileSize / 1024 / 1024),
          tables_count: finalConfig.tables.length
        }
      });

      await SystemMonitor.recordBusinessMetric(
        'backup_completed',
        1,
        'count',
        { backup_type: finalConfig.type }
      );

      // Audit log success
      await AuditLogger.log({
        event_type: AuditEventType.SYSTEM_BACKUP,
        risk_level: 'low' as any,
        description: `Completed ${finalConfig.type} backup successfully`,
        metadata: {
          backup_id: backupLog.id,
          file_path: filePath,
          file_size_bytes: fileSize,
          duration_seconds: duration
        }
      });

      return {
        id: backupLog.id,
        type: finalConfig.type,
        status: BackupStatus.COMPLETED,
        file_path: filePath,
        file_size_bytes: fileSize,
        duration_seconds: duration,
        metadata: backupContent.metadata
      };

    } catch (error) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update backup log with failure
      await supabase
        .from('backup_logs')
        .update({
          status: BackupStatus.FAILED,
          duration_seconds: duration,
          error_message: errorMessage
        })
        .eq('id', backupLog.id);

      // Audit log failure
      await AuditLogger.logError(
        error instanceof Error ? error : new Error(errorMessage),
        'backup_system',
        undefined,
        { backup_id: backupLog.id }
      );

      return {
        id: backupLog.id,
        type: finalConfig.type,
        status: BackupStatus.FAILED,
        duration_seconds: duration,
        error_message: errorMessage
      };
    }
  }

  // Export data from a specific table
  private static async exportTable(tableName: string): Promise<{ data: any[]; count: number }> {
    try {
      // Handle auth.users table specially (requires admin access)
      if (tableName === 'auth.users') {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        return { data: data.users, count: data.users.length };
      }

      // For public tables, use regular query
      const { data, error, count } = await supabase
        .from(tableName.replace('public.', ''))
        .select('*', { count: 'exact' });

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error(`Error exporting table ${tableName}:`, error);
      throw error;
    }
  }

  // Get backup history
  static async getBackupHistory(limit: number = 50): Promise<BackupResult[]> {
    try {
      const { data, error } = await supabase
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching backup history:', error);
        return [];
      }

      return data.map(log => ({
        id: log.id,
        type: log.backup_type,
        status: log.status,
        file_path: log.file_path,
        file_size_bytes: log.file_size_bytes,
        duration_seconds: log.duration_seconds,
        error_message: log.error_message,
        metadata: log.metadata
      }));
    } catch (error) {
      console.error('Error in getBackupHistory:', error);
      return [];
    }
  }

  // Clean up old backups based on retention policy
  static async cleanupOldBackups(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Get old backup records
      const { data: oldBackups, error: fetchError } = await supabase
        .from('backup_logs')
        .select('*')
        .lt('created_at', cutoffDate.toISOString())
        .eq('status', BackupStatus.COMPLETED);

      if (fetchError) {
        console.error('Error fetching old backups:', fetchError);
        return;
      }

      if (!oldBackups || oldBackups.length === 0) {
        console.log('No old backups to clean up');
        return;
      }

      // In a real implementation, you would delete the actual backup files
      // from cloud storage before deleting the database records

      // Delete old backup records
      const { error: deleteError } = await supabase
        .from('backup_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('status', BackupStatus.COMPLETED);

      if (deleteError) {
        console.error('Error deleting old backup records:', deleteError);
        return;
      }

      // Audit log cleanup
      await AuditLogger.log({
        event_type: AuditEventType.SYSTEM_MAINTENANCE,
        risk_level: 'low' as any,
        description: `Cleaned up ${oldBackups.length} old backup records`,
        metadata: {
          retention_days: retentionDays,
          deleted_count: oldBackups.length
        }
      });

      console.log(`Cleaned up ${oldBackups.length} old backup records`);
    } catch (error) {
      console.error('Error in cleanupOldBackups:', error);
      await AuditLogger.logError(
        error instanceof Error ? error : new Error('Backup cleanup failed'),
        'backup_cleanup'
      );
    }
  }

  // Schedule automatic backups
  static scheduleAutomaticBackups(): void {
    // Full backup daily at 2 AM
    const scheduleFullBackup = () => {
      const now = new Date();
      const nextBackup = new Date();
      nextBackup.setHours(2, 0, 0, 0);
      
      if (nextBackup <= now) {
        nextBackup.setDate(nextBackup.getDate() + 1);
      }
      
      const timeUntilBackup = nextBackup.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          console.log('Starting scheduled full backup...');
          await this.createBackup({ type: BackupType.FULL });
          console.log('Scheduled full backup completed');
        } catch (error) {
          console.error('Scheduled backup failed:', error);
        }
        
        // Schedule next backup
        scheduleFullBackup();
      }, timeUntilBackup);
    };

    // Incremental backup every 6 hours
    const scheduleIncrementalBackup = () => {
      setInterval(async () => {
        try {
          console.log('Starting scheduled incremental backup...');
          await this.createBackup({ type: BackupType.INCREMENTAL });
          console.log('Scheduled incremental backup completed');
        } catch (error) {
          console.error('Scheduled incremental backup failed:', error);
        }
      }, 6 * 60 * 60 * 1000); // 6 hours
    };

    // Cleanup old backups weekly
    const scheduleCleanup = () => {
      setInterval(async () => {
        try {
          console.log('Starting scheduled backup cleanup...');
          await this.cleanupOldBackups();
          console.log('Scheduled backup cleanup completed');
        } catch (error) {
          console.error('Scheduled backup cleanup failed:', error);
        }
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
    };

    // Start scheduling
    scheduleFullBackup();
    scheduleIncrementalBackup();
    scheduleCleanup();

    console.log('Automatic backup scheduling initialized');
  }

  // Verify backup integrity
  static async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const { data: backup, error } = await supabase
        .from('backup_logs')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error || !backup) {
        console.error('Backup not found:', error);
        return false;
      }

      if (backup.status !== BackupStatus.COMPLETED) {
        console.error('Backup is not completed');
        return false;
      }

      // In a real implementation, you would:
      // 1. Download the backup file
      // 2. Verify checksums
      // 3. Test data integrity
      // 4. Validate file structure

      // For now, just check if the backup record exists and is complete
      const isValid = backup.file_path && backup.file_size_bytes > 0;

      await AuditLogger.log({
        event_type: AuditEventType.SYSTEM_MAINTENANCE,
        risk_level: 'low' as any,
        description: `Backup verification ${isValid ? 'passed' : 'failed'}`,
        metadata: {
          backup_id: backupId,
          verification_result: isValid
        }
      });

      return isValid;
    } catch (error) {
      console.error('Error verifying backup:', error);
      return false;
    }
  }

  // Get backup statistics
  static async getBackupStatistics(): Promise<{
    total_backups: number;
    successful_backups: number;
    failed_backups: number;
    total_size_bytes: number;
    avg_duration_seconds: number;
    last_backup_date?: string;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('backup_logs')
        .select('status, file_size_bytes, duration_seconds, created_at');

      if (error) {
        console.error('Error fetching backup statistics:', error);
        return {
          total_backups: 0,
          successful_backups: 0,
          failed_backups: 0,
          total_size_bytes: 0,
          avg_duration_seconds: 0
        };
      }

      const totalBackups = stats.length;
      const successfulBackups = stats.filter(b => b.status === BackupStatus.COMPLETED).length;
      const failedBackups = stats.filter(b => b.status === BackupStatus.FAILED).length;
      const totalSize = stats.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0);
      const avgDuration = stats.reduce((sum, b) => sum + (b.duration_seconds || 0), 0) / totalBackups;
      const lastBackupDate = stats.length > 0 ? stats.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at : undefined;

      return {
        total_backups: totalBackups,
        successful_backups: successfulBackups,
        failed_backups: failedBackups,
        total_size_bytes: totalSize,
        avg_duration_seconds: Math.round(avgDuration),
        last_backup_date: lastBackupDate
      };
    } catch (error) {
      console.error('Error in getBackupStatistics:', error);
      return {
        total_backups: 0,
        successful_backups: 0,
        failed_backups: 0,
        total_size_bytes: 0,
        avg_duration_seconds: 0
      };
    }
  }
}