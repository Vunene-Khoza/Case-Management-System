import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ActivityLog, ActivityCategory, ActivityStatus } from '../models/activity-log.model';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ActivityLogPage {
  content: ActivityLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private apiUrl = 'http://localhost:8080/api/v1';

  private logsSubject = new BehaviorSubject<ActivityLog[]>([]);
  public logs$: Observable<ActivityLog[]> = this.logsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetch dynamic scoped activity logs from the backend API.
   */
  getLogs(params: {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  } = {}): Observable<ActivityLogPage> {
    let httpParams = new HttpParams()
      .set('page', (params.page !== undefined ? params.page : 0).toString())
      .set('size', (params.size !== undefined ? params.size : 10).toString())
      .set('sortBy', params.sortBy || 'timestamp')
      .set('sortDir', params.sortDir || 'desc');

    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.category && params.category !== 'ALL') {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.status && params.status !== 'ALL') {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/activity-logs`, { params: httpParams }).pipe(
      map(res => {
        const pageData = res.data || {};
        const items: any[] = pageData.content || [];
        const mappedLogs: ActivityLog[] = items.map(item => this.mapEntityToActivityLog(item));

        this.logsSubject.next(mappedLogs);

        return {
          content: mappedLogs,
          totalElements: pageData.totalElements !== undefined ? pageData.totalElements : mappedLogs.length,
          totalPages: pageData.totalPages !== undefined ? pageData.totalPages : 1,
          number: pageData.number || 0,
          size: pageData.size || params.size || 10
        };
      }),
      catchError(err => {
        console.warn('Failed to load activity logs from backend API:', err);
        this.logsSubject.next([]);
        return of({
          content: [],
          totalElements: 0,
          totalPages: 1,
          number: 0,
          size: params.size || 10
        });
      })
    );
  }

  /**
   * Record a new activity event in the backend audit trail.
   */
  logActivity(activity: {
    category: ActivityCategory;
    action: string;
    entityType: string;
    entityId?: string;
    description: string;
    status?: ActivityStatus;
    detailsJson?: string;
  }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/activity-logs`, activity).pipe(
      catchError(err => {
        console.warn('Failed to post activity log to backend:', err);
        return of({ success: false });
      })
    );
  }

  /**
   * Map backend ActivityLogResponse to frontend ActivityLog model.
   */
  private mapEntityToActivityLog(item: any): ActivityLog {
    let detailsObj: Record<string, any> | undefined = undefined;
    if (item.detailsJson) {
      try {
        detailsObj = JSON.parse(item.detailsJson);
      } catch (e) {
        detailsObj = { raw: item.detailsJson };
      }
    }

    return {
      id: item.id || '',
      timestamp: item.timestamp || new Date().toISOString(),
      userId: item.userId || '',
      userName: item.userName || 'System',
      userRole: item.userRole || '',
      userAvatar: item.userAvatar || 'profile0.png',
      category: item.category as ActivityCategory,
      action: item.action || '',
      entityType: item.entityType || '',
      entityId: item.entityId || '',
      description: item.description || '',
      ipAddress: item.ipAddress || '127.0.0.1',
      status: (item.status as ActivityStatus) || 'SUCCESS',
      details: detailsObj,
      detailsJson: item.detailsJson,
      actorAdminOwner: item.actorAdminOwner
    };
  }
}
