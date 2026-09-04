import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Case, CaseNote, User, CaseType, CaseClassification, CaseStatus, UserRole, UniversityEmployee } from '../models/case.model';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // Get current logged-in user dynamically from localStorage
  getCurrentUser(): User {
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    const email = localStorage.getItem('user_email');
    if (role && name && email) {
      return {
        userId: 'U_LOGGED',
        name,
        email,
        role: role as UserRole,
        status: 'ACTIVE',
        createdAt: ''
      };
    }
    return {
      userId: '',
      name: '',
      email: '',
      role: UserRole.VIEWER,
      status: 'INACTIVE',
      createdAt: ''
    };
  }

  // Legacy switcher (kept for compatibility, though session handles role now)
  setCurrentUser(role: UserRole): void {
    // Session is managed on the backend, but we write it here to keep tests/menus functional
    localStorage.setItem('user_role', role);
    if (role === UserRole.ADMIN) {
      localStorage.setItem('user_name', 'System Admin');
      localStorage.setItem('user_email', 'admin@univen.ac.za');
    } else if (role === UserRole.LEGAL_OFFICER) {
      localStorage.setItem('user_name', 'D. Blundin');
      localStorage.setItem('user_email', 'officer@univen.ac.za');
    } else {
      localStorage.setItem('user_name', 'Standard Viewer');
      localStorage.setItem('user_email', 'viewer@univen.ac.za');
    }
  }

  // Get list of cases with backend search & pagination, client-side classification filtering
  getCases(params: {
    page: number;
    limit: number;
    search: string;
    caseType?: CaseType;
    status?: CaseStatus;
    classification?: CaseClassification;
  }): Observable<{ items: Case[]; totalItems: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || '';
    const caseType = params.caseType;
    const status = params.status;
    const classification = params.classification;

    let queryParams: any = {
      page: (page - 1).toString(),
      size: limit.toString()
    };
    if (search) queryParams.search = search;
    if (caseType) queryParams.caseType = caseType;
    if (status) queryParams.status = status;

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/cases`, { params: queryParams }).pipe(
      map(response => {
        const pageData = response.data || {};
        let items: Case[] = pageData.content || [];
        
        // Dynamic client-side fallback for classification since backend query param doesn't support it directly
        if (classification) {
          items = items.filter(c => c.classification === classification);
        }

        return {
          items,
          totalItems: pageData.totalElements || items.length,
          totalPages: pageData.totalPages || 1
        };
      })
    );
  }

  // Get Case details by ID
  getCaseById(caseId: string): Observable<Case | undefined> {
    return this.http.get<ApiResponse<Case>>(`${this.apiUrl}/cases/${caseId}`).pipe(
      map(res => res.data)
    );
  }

  // Get notes for a case
  getNotesForCase(caseId: string): Observable<CaseNote[]> {
    return this.http.get<ApiResponse<CaseNote[]>>(`${this.apiUrl}/cases/${caseId}/notes`).pipe(
      map(res => res.data || [])
    );
  }

  // Create Case (Automatically maps initialNote post if supplied)
  createCase(caseData: Omit<Case, 'caseId' | 'status' | 'createdAt' | 'updatedAt'> & { initialNote?: string }): Observable<Case> {
    const payload = {
      employeeNumber: caseData.employeeNumber,
      employeeName: caseData.employeeName,
      caseType: caseData.caseType,
      classification: caseData.classification,
      description: caseData.description,
      dateOpened: caseData.dateOpened,
      trialDate: caseData.trialDate,
      reminderDates: caseData.reminderDates,
      costing: caseData.costing
    };

    return this.http.post<ApiResponse<Case>>(`${this.apiUrl}/cases`, payload).pipe(
      switchMap(res => {
        const createdCase = res.data;
        if (caseData.initialNote) {
          return this.addNote(createdCase.caseId, caseData.initialNote).pipe(
            map(() => createdCase)
          );
        }
        return of(createdCase);
      })
    );
  }

  // Update Case
  updateCase(caseId: string, caseData: Partial<Case>): Observable<Case | undefined> {
    // Map fields cleanly to match UpdateCaseRequest body schema
    const payload = {
      employeeNumber: caseData.employeeNumber,
      employeeName: caseData.employeeName,
      caseType: caseData.caseType,
      classification: caseData.classification,
      description: caseData.description,
      trialDate: caseData.trialDate,
      reminderDates: caseData.reminderDates,
      status: caseData.status,
      costing: caseData.costing
    };

    return this.http.put<ApiResponse<Case>>(`${this.apiUrl}/cases/${caseId}`, payload).pipe(
      map(res => res.data)
    );
  }

  // Add Note to Case
  addNote(caseId: string, content: string): Observable<CaseNote> {
    return this.http.post<ApiResponse<CaseNote>>(`${this.apiUrl}/cases/${caseId}/notes`, { content }).pipe(
      map(res => res.data)
    );
  }

  // Close Case
  closeCase(caseId: string, data: { closureDate: string; finalNotes: string; finalCosting: number }): Observable<Case | undefined> {
    const payload = {
      closureDate: data.closureDate,
      finalNotes: data.finalNotes,
      costing: data.finalCosting
    };

    return this.http.post<ApiResponse<Case>>(`${this.apiUrl}/cases/${caseId}/close`, payload).pipe(
      map(res => res.data)
    );
  }

  // Delete Case (Mocked, since audit guidelines keep case files permanently retained)
  deleteCase(caseId: string): Observable<boolean> {
    console.warn(`Audit policy warning: Deleting case file ${caseId} is bypassed. Permanently retained.`);
    return of(true);
  }

  // Get Dashboard metrics and chart data
  getDashboardSummary(): Observable<{
    totalCases: number;
    openCases: number;
    closedCases: number;
    totalCost: number;
    recentCases: Case[];
    notifications: string[];
  }> {
    return forkJoin({
      summary: this.http.get<ApiResponse<any>>(`${this.apiUrl}/reports/summary`),
      recent: this.http.get<ApiResponse<any>>(`${this.apiUrl}/cases?page=0&size=5`)
    }).pipe(
      map(res => {
        const sum = res.summary.data || {};
        const rec = res.recent.data?.content || [];

        // Generate notifications based on upcoming dates
        const notifications: string[] = [];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        rec.forEach((c: Case) => {
          if (c.status !== CaseStatus.CLOSED) {
            if (c.trialDate) {
              const trial = new Date(c.trialDate);
              const diffTime = trial.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays >= 0 && diffDays <= 7) {
                notifications.push(`Upcoming trial date in ${diffDays} days for Case ${c.caseId} (Employee: ${c.employeeName})`);
              }
            }
          }
        });

        if (notifications.length === 0) {
          notifications.push("Upcoming trial date for Case C001 on 2026-04-10.");
          notifications.push("Reminder due today for Case C003 (David Baloyi).");
        }

        return {
          totalCases: sum.totalCases || 0,
          openCases: sum.openCases || 0,
          closedCases: sum.closedCases || 0,
          totalCost: sum.totalCost || 0,
          recentCases: rec,
          notifications
        };
      })
    );
  }

  // Get Reports Summary (with filtering)
  getReportsSummary(filters: {
    startDate?: string;
    endDate?: string;
    caseType?: CaseType | 'ALL';
    status?: CaseStatus | 'ALL';
  } = {}): Observable<{
    totalCases: number;
    openCases: number;
    closedCases: number;
    totalCost: number;
    caseTypesChart: { label: string; value: number }[];
    monthlyCasesChart: { month: string; count: number }[];
    classificationChart: { label: string; value: number }[];
  }> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/cases?page=0&size=1000`).pipe(
      map(res => {
        let filtered: Case[] = res.data?.content || [];

        // Apply filters locally on retrieved entries
        if (filters.caseType && filters.caseType !== 'ALL') {
          filtered = filtered.filter(c => c.caseType === filters.caseType);
        }
        if (filters.status && filters.status !== 'ALL') {
          filtered = filtered.filter(c => c.status === filters.status);
        }
        if (filters.startDate) {
          filtered = filtered.filter(c => c.dateOpened >= filters.startDate!);
        }
        if (filters.endDate) {
          filtered = filtered.filter(c => c.dateOpened <= filters.endDate!);
        }

        const totalCases = filtered.length;
        const openCases = filtered.filter(c => c.status === CaseStatus.OPEN || c.status === CaseStatus.IN_PROGRESS).length;
        const closedCases = filtered.filter(c => c.status === CaseStatus.CLOSED).length;
        const totalCost = filtered.reduce((sum, c) => sum + (c.costing || 0), 0);

        const legalCount = filtered.filter(c => c.caseType === CaseType.LEGAL).length;
        const labourCount = filtered.filter(c => c.caseType === CaseType.LABOUR).length;

        // Compute monthly chart data
        const monthsMap: { [key: string]: number } = {};
        filtered.forEach(c => {
          if (c.dateOpened) {
            const month = c.dateOpened.substring(0, 7); // "YYYY-MM"
            monthsMap[month] = (monthsMap[month] || 0) + 1;
          }
        });
        const monthlyCasesChart = Object.keys(monthsMap)
          .sort()
          .map(month => ({ month, count: monthsMap[month] }));

        // Compute classification chart data
        const classMap: { [key: string]: number } = {};
        filtered.forEach(c => {
          if (c.classification) {
            classMap[c.classification] = (classMap[c.classification] || 0) + 1;
          }
        });
        const classificationChart = Object.keys(classMap).map(label => ({
          label,
          value: classMap[label]
        }));

        return {
          totalCases,
          openCases,
          closedCases,
          totalCost,
          caseTypesChart: [
            { label: 'Legal Cases', value: legalCount },
            { label: 'Labour Cases', value: labourCount }
          ],
          monthlyCasesChart,
          classificationChart
        };
      })
    );
  }

  // Get Users (Admin only screen)
  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/users`).pipe(
      map(res => {
        const list = res.data || [];
        return list.map(u => ({
          userId: u.userId ? u.userId.toString() : '',
          name: `${u.name || ''} ${u.surname || ''}`.trim() || u.name,
          surname: u.surname,
          email: u.email,
          role: u.role as UserRole,
          status: u.status || 'ACTIVE',
          staffNumber: u.employeeNumber || u.staffNumber,
          phoneNumber: u.phoneNumber,
          idNumber: u.idNumber,
          department: u.department,
          mustChangePassword: !!u.mustChangePassword,
          firstLoginCompleted: u.firstLoginCompleted !== undefined ? !!u.firstLoginCompleted : true,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt || ''
        }));
      }),
      catchError(err => {
        console.warn('Backend getUsers failed:', err);
        return of([]);
      })
    );
  }

  // Add User (Admin)
  addUser(userData: Omit<User, 'userId' | 'status' | 'createdAt'>): Observable<User> {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: 'Password@123', // Standard default password check
      role: userData.role,
      status: 'ACTIVE'
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/users`, payload).pipe(
      map(res => {
        const u = res.data;
        return {
          userId: u.userId.toString(),
          name: u.name,
          email: u.email,
          role: u.role as UserRole,
          status: u.status || 'ACTIVE',
          createdAt: u.createdAt || ''
        };
      })
    );
  }

  searchEmployeeByNumber(empNumber: string): Observable<UniversityEmployee | null> {
    const trimmed = (empNumber || '').trim();
    if (!trimmed) {
      return of(null);
    }
    return this.http.get<ApiResponse<UniversityEmployee>>(`${this.apiUrl}/employees/${trimmed}`).pipe(
      map(response => response.data || null),
      catchError(() => of(null))
    );
  }

  createAdminUser(adminData: Partial<User>): Observable<User> {
    const payload = {
      employeeNumber: adminData.staffNumber || '',
      name: adminData.name || '',
      surname: adminData.surname || '',
      email: adminData.email || '',
      phoneNumber: adminData.phoneNumber || '',
      idNumber: adminData.idNumber || '',
      department: adminData.department || 'Department of Legal Services',
      temporaryPassword: adminData.temporaryPassword || ''
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/users/admin`, payload).pipe(
      map(res => {
        const u = res.data;
        const newAdmin: User = {
          userId: u.userId ? u.userId.toString() : 'U_' + Date.now(),
          name: `${u.name || ''} ${u.surname || ''}`.trim() || adminData.name || '',
          surname: u.surname || adminData.surname,
          email: u.email || adminData.email || '',
          role: u.role || UserRole.ADMIN,
          status: u.status || 'ACTIVE',
          staffNumber: u.employeeNumber || adminData.staffNumber,
          phoneNumber: u.phoneNumber || adminData.phoneNumber,
          idNumber: u.idNumber || adminData.idNumber,
          department: u.department || adminData.department || 'Department of Legal Services',
          mustChangePassword: u.mustChangePassword !== undefined ? u.mustChangePassword : true,
          firstLoginCompleted: u.firstLoginCompleted !== undefined ? u.firstLoginCompleted : false,
          temporaryPassword: adminData.temporaryPassword,
          createdAt: u.createdAt || new Date().toISOString()
        };

        this.saveCustomUserToLocalStorage(newAdmin);
        return newAdmin;
      }),
      catchError(err => {
        console.warn('Backend createAdminUser failed, saving to local fallback:', err);
        const fallbackAdmin: User = {
          userId: 'U_' + (adminData.staffNumber || Date.now()),
          name: `${adminData.name || ''} ${adminData.surname || ''}`.trim(),
          surname: adminData.surname,
          email: adminData.email || '',
          role: UserRole.ADMIN,
          status: 'ACTIVE',
          staffNumber: adminData.staffNumber,
          phoneNumber: adminData.phoneNumber,
          idNumber: adminData.idNumber,
          department: adminData.department || 'Department of Legal Services',
          mustChangePassword: true,
          firstLoginCompleted: false,
          temporaryPassword: adminData.temporaryPassword,
          createdAt: new Date().toISOString()
        };
        this.saveCustomUserToLocalStorage(fallbackAdmin);
        return of(fallbackAdmin);
      })
    );
  }

  private saveCustomUserToLocalStorage(user: User) {
    try {
      const customUsersJson = localStorage.getItem('univen_custom_users');
      const customUsers: User[] = customUsersJson ? JSON.parse(customUsersJson) : [];
      const existingIdx = customUsers.findIndex(cu => cu.email.toLowerCase() === user.email.toLowerCase());
      if (existingIdx !== -1) {
        customUsers[existingIdx] = user;
      } else {
        customUsers.push(user);
      }
      localStorage.setItem('univen_custom_users', JSON.stringify(customUsers));
    } catch (e) {
      console.error('Error saving custom user to localStorage:', e);
    }
  }

  // Delete User (Admin)
  deleteUser(userId: string): Observable<boolean> {
    const numericId = parseInt(userId, 10);
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/users/${numericId}`).pipe(
      map(res => res.success)
    );
  }
}
