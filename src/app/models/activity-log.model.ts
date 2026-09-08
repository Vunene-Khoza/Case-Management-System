import { UserRole } from './case.model';

export enum ActivityCategory {
  CASE = 'CASE',
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
  REPORT = 'REPORT'
}

export type ActivityStatus = 'SUCCESS' | 'WARNING' | 'FAILED';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO 8601 string
  userId: string;
  userName: string;
  userRole: UserRole | string;
  userAvatar?: string;
  category: ActivityCategory;
  action: string;       // e.g. "CASE_CREATED", "STATUS_UPDATED", "NOTE_ADDED", "USER_ADDED", etc.
  entityType: string;   // e.g. "Case", "User", "Note", "Settings", "Report"
  entityId?: string;    // e.g. "C001", "U002"
  description: string;  // Detailed readable summary
  ipAddress: string;
  status: ActivityStatus;
  details?: Record<string, any>; // Arbitrary metadata payload for modal detail viewer
  detailsJson?: string;
  actorAdminOwner?: string;
}
