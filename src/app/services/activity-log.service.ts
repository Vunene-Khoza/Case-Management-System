import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityLog, ActivityCategory, ActivityStatus } from '../models/activity-log.model';
import { UserRole } from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private initialLogs: ActivityLog[] = [
    {
      id: 'LOG-1015',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
      userId: 'U001',
      userName: 'R.E. Mukosi',
      userRole: UserRole.ADMIN,
      userAvatar: 'profile0.png',
      category: ActivityCategory.CASE,
      action: 'STATUS_UPDATED',
      entityType: 'Case',
      entityId: 'C001',
      description: 'Updated case status for John Doe (Unauthorized absence) from IN_PROGRESS to OPEN',
      ipAddress: '196.21.14.88',
      status: 'SUCCESS',
      details: {
        previousStatus: 'IN_PROGRESS',
        newStatus: 'OPEN',
        assignedOfficer: 'R.E. Mukosi',
        updatedFields: ['status', 'updatedAt']
      }
    },
    {
      id: 'LOG-1014',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      userId: 'U002',
      userName: 'Sarah Mokoena',
      userRole: UserRole.LEGAL_OFFICER,
      category: ActivityCategory.CASE,
      action: 'NOTE_ADDED',
      entityType: 'Note',
      entityId: 'C003',
      description: 'Added formal note on grievance case regarding departmental space allocation',
      ipAddress: '196.21.14.102',
      status: 'SUCCESS',
      details: {
        noteId: 'N104',
        caseId: 'C003',
        contentSnippet: 'Witness statement received from Department Head. Arbitration scheduled.'
      }
    },
    {
      id: 'LOG-1013',
      timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(), // 1h 50m ago
      userId: 'U001',
      userName: 'R.E. Mukosi',
      userRole: UserRole.ADMIN,
      userAvatar: 'profile0.png',
      category: ActivityCategory.USER,
      action: 'USER_ADDED',
      entityType: 'User',
      entityId: 'U004',
      description: 'Created new legal officer account for Dr. T. Netshiluvhi',
      ipAddress: '196.21.14.88',
      status: 'SUCCESS',
      details: {
        newUserId: 'U004',
        name: 'Dr. T. Netshiluvhi',
        email: 't.netshiluvhi@univen.ac.za',
        role: UserRole.LEGAL_OFFICER
      }
    },
    {
      id: 'LOG-1012',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4h ago
      userId: 'U003',
      userName: 'David Baloyi',
      userRole: UserRole.LEGAL_OFFICER,
      category: ActivityCategory.REPORT,
      action: 'REPORT_GENERATED',
      entityType: 'Report',
      entityId: 'REP-2026-08',
      description: 'Generated Q3 Legal Expenditure and Case Costing Summary (PDF)',
      ipAddress: '196.21.14.95',
      status: 'SUCCESS',
      details: {
        reportType: 'Financial Costing',
        period: 'Q3 2026',
        fileFormat: 'PDF',
        recordCount: 14
      }
    },
    {
      id: 'LOG-1011',
      timestamp: new Date(Date.now() - 1000 * 60 * 380).toISOString(), // ~6h ago
      userId: 'SYSTEM',
      userName: 'System Sentinel',
      userRole: 'SYSTEM_BOT',
      category: ActivityCategory.SECURITY,
      action: 'LOGIN_FAILED',
      entityType: 'Security',
      description: 'Multiple failed login attempts detected for IP 41.203.77.19 (Locked 15 mins)',
      ipAddress: '41.203.77.19',
      status: 'FAILED',
      details: {
        targetEmail: 'admin@univen.ac.za',
        failedAttempts: 5,
        actionTaken: 'IP temporary lockout enforced'
      }
    },
    {
      id: 'LOG-1010',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      userId: 'U001',
      userName: 'R.E. Mukosi',
      userRole: UserRole.ADMIN,
      userAvatar: 'profile0.png',
      category: ActivityCategory.SYSTEM,
      action: 'SETTINGS_SAVED',
      entityType: 'Settings',
      description: 'Updated system security parameters: Enabled Mandatory Note on Status Change',
      ipAddress: '196.21.14.88',
      status: 'SUCCESS',
      details: {
        module: 'Security & System Rules',
        changedKeys: ['requireNoteOnStatusChange', 'auditLogging']
      }
    },
    {
      id: 'LOG-1009',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // ~1 day ago
      userId: 'U002',
      userName: 'Sarah Mokoena',
      userRole: UserRole.LEGAL_OFFICER,
      category: ActivityCategory.CASE,
      action: 'CASE_CREATED',
      entityType: 'Case',
      entityId: 'C004',
      description: 'Registered new litigation case for Sarah Mokoena (Breach of contract litigation)',
      ipAddress: '196.21.14.102',
      status: 'SUCCESS',
      details: {
        caseId: 'C004',
        classification: 'LITIGATION',
        caseType: 'LEGAL',
        costing: 45000
      }
    },
    {
      id: 'LOG-1008',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      userId: 'U001',
      userName: 'R.E. Mukosi',
      userRole: UserRole.ADMIN,
      userAvatar: 'profile0.png',
      category: ActivityCategory.CASE,
      action: 'CASE_CLOSED',
      entityType: 'Case',
      entityId: 'C002',
      description: 'Closed dispute case C002 (Mary Khumalo) following CCMA arbitration settlement',
      ipAddress: '196.21.14.88',
      status: 'SUCCESS',
      details: {
        caseId: 'C002',
        closureDate: '2026-03-15',
        finalCost: 25000,
        settlementStatus: 'Agreed'
      }
    },
    {
      id: 'LOG-1007',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      userId: 'U003',
      userName: 'David Baloyi',
      userRole: UserRole.LEGAL_OFFICER,
      category: ActivityCategory.SECURITY,
      action: 'PASSWORD_CHANGED',
      entityType: 'Security',
      description: 'User successfully updated security credentials and refreshed 2FA token',
      ipAddress: '196.21.14.95',
      status: 'SUCCESS',
      details: {
        userId: 'U003',
        authMethod: '2FA TOTP'
      }
    },
    {
      id: 'LOG-1006',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
      userId: 'U001',
      userName: 'R.E. Mukosi',
      userRole: UserRole.ADMIN,
      userAvatar: 'profile0.png',
      category: ActivityCategory.USER,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: 'U099',
      description: 'Revoked access and deleted inactive account for temp officer J. Sithole',
      ipAddress: '196.21.14.88',
      status: 'WARNING',
      details: {
        deletedUserId: 'U099',
        reason: 'Contract completion',
        revokedBy: 'R.E. Mukosi'
      }
    }
  ];

  private logsSubject = new BehaviorSubject<ActivityLog[]>(this.initialLogs);
  public logs$: Observable<ActivityLog[]> = this.logsSubject.asObservable();

  constructor() {}

  /**
   * Return all activity logs
   */
  getLogs(): Observable<ActivityLog[]> {
    return this.logs$;
  }

  /**
   * Add a new activity log entry to the top of the stream
   */
  logActivity(activity: Partial<ActivityLog>): void {
    const currentLogs = this.logsSubject.getValue();
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: activity.timestamp || new Date().toISOString(),
      userId: activity.userId || 'U001',
      userName: activity.userName || 'R.E. Mukosi',
      userRole: activity.userRole || UserRole.ADMIN,
      userAvatar: activity.userAvatar || 'profile0.png',
      category: activity.category || ActivityCategory.SYSTEM,
      action: activity.action || 'SYSTEM_ACTION',
      entityType: activity.entityType || 'General',
      entityId: activity.entityId,
      description: activity.description || 'System event recorded',
      ipAddress: activity.ipAddress || '196.21.14.88',
      status: activity.status || 'SUCCESS',
      details: activity.details || {}
    };

    this.logsSubject.next([newLog, ...currentLogs]);
  }

  /**
   * Reset / clear activity log history
   */
  clearLogs(): void {
    this.logsSubject.next([]);
  }

  /**
   * Simulate a random real-time activity event for demo purposes
   */
  simulateEvent(): void {
    const sampleEvents = [
      {
        category: ActivityCategory.CASE,
        action: 'HEARING_SCHEDULED',
        entityType: 'Case',
        entityId: 'C001',
        description: 'Scheduled disciplinary hearing for C001 on 2026-08-20',
        status: 'SUCCESS' as ActivityStatus,
        details: { location: 'Legal Chamber B', panelChair: 'Prof. A. Ramaphosa' }
      },
      {
        category: ActivityCategory.SECURITY,
        action: '2FA_VERIFIED',
        entityType: 'Security',
        description: 'Successful multi-factor authentication from new session browser',
        status: 'SUCCESS' as ActivityStatus,
        details: { browser: 'Chrome 122', device: 'Windows NT 10.0' }
      },
      {
        category: ActivityCategory.REPORT,
        action: 'CSV_EXPORTED',
        entityType: 'Report',
        description: 'Exported active case roster to CSV spreadsheet format',
        status: 'SUCCESS' as ActivityStatus,
        details: { recordsExported: 5, exportScope: 'All Active Cases' }
      },
      {
        category: ActivityCategory.SYSTEM,
        action: 'CACHE_PURGED',
        entityType: 'System',
        description: 'System cache & index re-synchronized successfully',
        status: 'SUCCESS' as ActivityStatus,
        details: { itemsIndexed: 142 }
      }
    ];

    const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
    this.logActivity(randomEvent);
  }
}
