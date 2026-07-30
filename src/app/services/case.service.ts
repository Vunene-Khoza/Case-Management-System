import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Case, CaseNote, User, CaseType, CaseClassification, CaseStatus, UserRole } from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  // In-memory store for cases
  private cases: Case[] = [
    {
      caseId: 'C001',
      employeeNumber: '12345',
      employeeName: 'John Doe',
      caseType: CaseType.LEGAL,
      classification: CaseClassification.DISCIPLINARY,
      description: 'Unauthorized absence, failure to report for duty, and breach of standard university code of conduct.',
      dateOpened: '2026-03-01',
      trialDate: '2026-04-10',
      reminderDates: ['2026-04-01', '2026-04-05'],
      status: CaseStatus.OPEN,
      costing: 15000.00,
      createdAt: '2026-03-01T08:00:00Z',
      updatedAt: '2026-03-25T11:30:00Z'
    },
    {
      caseId: 'C002',
      employeeNumber: '67890',
      employeeName: 'Mary Khumalo',
      caseType: CaseType.LABOUR,
      classification: CaseClassification.DISPUTE,
      description: 'Salary grading dispute regarding promotion structure and salary alignment with institutional standards.',
      dateOpened: '2026-02-15',
      trialDate: '2026-03-15',
      reminderDates: ['2026-03-01', '2026-03-10'],
      status: CaseStatus.CLOSED,
      closureDate: '2026-03-15',
      finalNotes: 'Settlement reached through CCMA arbitration. Adjustments made to grading.',
      costing: 25000.00,
      createdAt: '2026-02-15T09:30:00Z',
      updatedAt: '2026-03-15T16:00:00Z'
    },
    {
      caseId: 'C003',
      employeeNumber: '11223',
      employeeName: 'David Baloyi',
      caseType: CaseType.LABOUR,
      classification: CaseClassification.DISPUTE,
      description: 'Unfair treatment allegation filed against departmental head concerning workspace allocation.',
      dateOpened: '2026-05-10',
      trialDate: '2026-07-28',
      reminderDates: ['2026-07-15', '2026-07-25'],
      status: CaseStatus.IN_PROGRESS,
      costing: 8500.00,
      createdAt: '2026-05-10T11:00:00Z',
      updatedAt: '2026-07-20T14:20:00Z'
    },
    {
      caseId: 'C004',
      employeeNumber: '44556',
      employeeName: 'Sarah Mokoena',
      caseType: CaseType.LEGAL,
      classification: CaseClassification.LITIGATION,
      description: 'Breach of contract litigation regarding external consultancy hours without written university permission.',
      dateOpened: '2026-06-01',
      trialDate: '2026-08-15',
      reminderDates: ['2026-08-01', '2026-08-10'],
      status: CaseStatus.OPEN,
      costing: 45000.00,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z'
    },
    {
      caseId: 'C005',
      employeeNumber: '77889',
      employeeName: 'Peter Netshiluvhi',
      caseType: CaseType.LEGAL,
      classification: CaseClassification.DISCIPLINARY,
      description: 'Misuse of university research funds for unauthorized travel and conference attendance.',
      dateOpened: '2026-01-10',
      trialDate: '2026-02-20',
      reminderDates: ['2026-02-01', '2026-02-15'],
      status: CaseStatus.CLOSED,
      closureDate: '2026-02-25',
      finalNotes: 'Employee was found guilty at internal hearing. Written warning issued. Costs recovered.',
      costing: 12000.00,
      createdAt: '2026-01-10T08:30:00Z',
      updatedAt: '2026-02-25T15:30:00Z'
    }
  ];

  // In-memory store for notes
  private notes: CaseNote[] = [
    {
      noteId: 'N1',
      caseId: 'C001',
      authorId: 'U001',
      authorName: 'Admin A',
      content: 'Initial hearing scheduled with disciplinary committee panel.',
      createdAt: '2026-03-20T09:00:00Z'
    },
    {
      noteId: 'N2',
      caseId: 'C001',
      authorId: 'U002',
      authorName: 'User B (Legal Officer)',
      content: 'Employee requested postponement due to medical reasons. Rejected, new medical certificate requested.',
      createdAt: '2026-03-25T11:30:00Z'
    },
    {
      noteId: 'N3',
      caseId: 'C002',
      authorId: 'U002',
      authorName: 'User B (Legal Officer)',
      content: 'CCMA conciliation unsuccessful. Matter referred to arbitration on 2026-03-15.',
      createdAt: '2026-03-01T14:00:00Z'
    },
    {
      noteId: 'N4',
      caseId: 'C002',
      authorId: 'U001',
      authorName: 'Admin A',
      content: 'Arbitration award received. Settlement finalized and case closed.',
      createdAt: '2026-03-15T15:45:00Z'
    }
  ];

  // In-memory store for users
  private users: User[] = [
    {
      userId: 'U001',
      name: 'Admin A',
      email: 'admin@univen.ac.za',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      createdAt: '2026-01-01T08:00:00Z'
    },
    {
      userId: 'U002',
      name: 'User B (Legal Officer)',
      email: 'user@univen.ac.za',
      role: UserRole.LEGAL_OFFICER,
      status: 'ACTIVE',
      createdAt: '2026-01-02T09:00:00Z'
    },
    {
      userId: 'U003',
      name: 'Viewer C',
      email: 'viewer@univen.ac.za',
      role: UserRole.VIEWER,
      status: 'ACTIVE',
      createdAt: '2026-01-05T10:00:00Z'
    }
  ];

  private currentUser: User = this.users[0]; // Logged in as Admin A by default

  constructor() {}

  // Get current logged-in user
  getCurrentUser(): User {
    return this.currentUser;
  }

  // Set current user (for switching roles/demo purposes)
  setCurrentUser(role: UserRole): void {
    const found = this.users.find(u => u.role === role);
    if (found) {
      this.currentUser = found;
    }
  }

  // Get users (Admin only screen)
  getUsers(): Observable<User[]> {
    return of([...this.users]).pipe(delay(300));
  }

  // Add new user (Admin)
  addUser(userData: Omit<User, 'userId' | 'status' | 'createdAt'>): Observable<User> {
    const newUser: User = {
      ...userData,
      userId: 'U' + (this.users.length + 1).toString().padStart(3, '0'),
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return of(newUser).pipe(delay(300));
  }

  // Delete user (Admin)
  deleteUser(userId: string): Observable<boolean> {
    const index = this.users.findIndex(u => u.userId === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // Query Cases (List page with pagination, search & filters)
  getCases(filters: {
    page?: number;
    limit?: number;
    search?: string;
    caseType?: CaseType | 'ALL';
    status?: CaseStatus | 'ALL';
    classification?: CaseClassification | 'ALL';
  } = {}): Observable<{ items: Case[]; totalItems: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const search = filters.search ? filters.search.toLowerCase() : '';
    const caseType = filters.caseType || 'ALL';
    const status = filters.status || 'ALL';
    const classification = filters.classification || 'ALL';

    return of(null).pipe(
      delay(300), // Simulating API response delay
      map(() => {
        let filtered = [...this.cases];

        // Filter by Case Type
        if (caseType !== 'ALL') {
          filtered = filtered.filter(c => c.caseType === caseType);
        }

        // Filter by Case Status
        if (status !== 'ALL') {
          filtered = filtered.filter(c => c.status === status);
        }

        // Filter by Classification
        if (classification !== 'ALL') {
          filtered = filtered.filter(c => c.classification === classification);
        }

        // Search text (employee name, employee number, case id)
        if (search) {
          filtered = filtered.filter(c => 
            c.caseId.toLowerCase().includes(search) ||
            c.employeeName.toLowerCase().includes(search) ||
            c.employeeNumber.includes(search) ||
            c.classification.toLowerCase().includes(search)
          );
        }

        // Sort by opened date descending
        filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        // Pagination
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const items = filtered.slice(startIndex, startIndex + limit);

        return {
          items,
          totalItems,
          totalPages
        };
      })
    );
  }

  // Get Case Details by ID
  getCaseById(caseId: string): Observable<Case | undefined> {
    return of(this.cases.find(c => c.caseId === caseId)).pipe(delay(250));
  }

  // Get notes for a case
  getNotesForCase(caseId: string): Observable<CaseNote[]> {
    return of(this.notes.filter(n => n.caseId === caseId))
      .pipe(
        delay(250),
        map(notes => notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      );
  }

  // Create Case (Automatically assigns ID Cxxx)
  createCase(caseData: Omit<Case, 'caseId' | 'status' | 'createdAt' | 'updatedAt'> & { initialNote?: string }): Observable<Case> {
    // Generate next case ID (e.g., C006)
    const numericIds = this.cases.map(c => parseInt(c.caseId.substring(1), 10));
    const nextIdVal = Math.max(...numericIds, 0) + 1;
    const caseId = 'C' + nextIdVal.toString().padStart(3, '0');

    const newCase: Case = {
      caseId,
      employeeNumber: caseData.employeeNumber,
      employeeName: caseData.employeeName,
      caseType: caseData.caseType,
      classification: caseData.classification,
      description: caseData.description,
      dateOpened: caseData.dateOpened,
      trialDate: caseData.trialDate || null,
      reminderDates: caseData.reminderDates || [],
      status: CaseStatus.OPEN,
      costing: caseData.costing || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.cases.push(newCase);

    // If an initial note is provided, add it to notes
    if (caseData.initialNote) {
      this.notes.push({
        noteId: 'N' + (this.notes.length + 1).toString(),
        caseId,
        authorId: this.currentUser.userId,
        authorName: this.currentUser.name,
        content: caseData.initialNote,
        createdAt: new Date().toISOString()
      });
    }

    return of(newCase).pipe(delay(350));
  }

  // Update Case
  updateCase(caseId: string, caseData: Partial<Case>): Observable<Case | undefined> {
    const index = this.cases.findIndex(c => c.caseId === caseId);
    if (index === -1) return of(undefined);

    const updated: Case = {
      ...this.cases[index],
      ...caseData,
      updatedAt: new Date().toISOString()
    };
    this.cases[index] = updated;

    return of(updated).pipe(delay(300));
  }

  // Add Note to Case
  addNote(caseId: string, content: string): Observable<CaseNote> {
    const newNote: CaseNote = {
      noteId: 'N' + (this.notes.length + 1).toString(),
      caseId,
      authorId: this.currentUser.userId,
      authorName: this.currentUser.name,
      content,
      createdAt: new Date().toISOString()
    };
    this.notes.push(newNote);
    return of(newNote).pipe(delay(250));
  }

  // Close Case
  closeCase(caseId: string, data: { closureDate: string; finalNotes: string; finalCosting: number }): Observable<Case | undefined> {
    const index = this.cases.findIndex(c => c.caseId === caseId);
    if (index === -1) return of(undefined);

    const updated: Case = {
      ...this.cases[index],
      status: CaseStatus.CLOSED,
      closureDate: data.closureDate,
      finalNotes: data.finalNotes,
      costing: data.finalCosting,
      updatedAt: new Date().toISOString()
    };
    this.cases[index] = updated;

    // Add closure note
    this.notes.push({
      noteId: 'N' + (this.notes.length + 1).toString(),
      caseId,
      authorId: this.currentUser.userId,
      authorName: this.currentUser.name,
      content: `Case Closed: ${data.finalNotes} (Final Cost: R ${data.finalCosting.toLocaleString()})`,
      createdAt: new Date().toISOString()
    });

    return of(updated).pipe(delay(350));
  }

  // Delete Case
  deleteCase(caseId: string): Observable<boolean> {
    const index = this.cases.findIndex(c => c.caseId === caseId);
    if (index !== -1) {
      this.cases.splice(index, 1);
      // Clean up notes
      this.notes = this.notes.filter(n => n.caseId !== caseId);
      return of(true).pipe(delay(250));
    }
    return of(false).pipe(delay(250));
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
    return of(null).pipe(
      delay(300),
      map(() => {
        const total = this.cases.length;
        const open = this.cases.filter(c => c.status === CaseStatus.OPEN || c.status === CaseStatus.IN_PROGRESS).length;
        const closed = this.cases.filter(c => c.status === CaseStatus.CLOSED).length;
        const totalCost = this.cases.reduce((sum, c) => sum + c.costing, 0);

        // Sorting cases by updatedAt desc for recent cases
        const sorted = [...this.cases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const recentCases = sorted.slice(0, 5);

        // Generate notifications based on upcoming dates
        const notifications: string[] = [];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        this.cases.forEach(c => {
          if (c.status !== CaseStatus.CLOSED) {
            // Check trial dates
            if (c.trialDate) {
              const trial = new Date(c.trialDate);
              const diffTime = trial.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays >= 0 && diffDays <= 7) {
                notifications.push(`Upcoming trial date in ${diffDays} days for Case ${c.caseId} (Employee: ${c.employeeName})`);
              }
            }

            // Check reminders
            c.reminderDates.forEach(rDate => {
              if (rDate === todayStr) {
                notifications.push(`Reminder due today for Case ${c.caseId} (Employee: ${c.employeeName})`);
              }
            });
          }
        });

        // Add standard fallback notifications if empty
        if (notifications.length === 0) {
          notifications.push("Upcoming trial date for Case C001 on 2026-04-10.");
          notifications.push("Reminder due today for Case C003 (David Baloyi).");
        }

        return {
          totalCases: total,
          openCases: open,
          closedCases: closed,
          totalCost,
          recentCases,
          notifications
        };
      })
    );
  }

  // Get Reports Summary
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
    return of(null).pipe(
      delay(300),
      map(() => {
        let filtered = [...this.cases];

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
        const totalCost = filtered.reduce((sum, c) => sum + c.costing, 0);

        // Chart 1: Case Types
        const legalCount = filtered.filter(c => c.caseType === CaseType.LEGAL).length;
        const labourCount = filtered.filter(c => c.caseType === CaseType.LABOUR).length;

        // Chart 2: Monthly Cases
        const monthsMap: { [key: string]: number } = {};
        filtered.forEach(c => {
          const month = c.dateOpened.substring(0, 7); // "YYYY-MM"
          monthsMap[month] = (monthsMap[month] || 0) + 1;
        });
        const monthlyCasesChart = Object.keys(monthsMap)
          .sort()
          .map(month => ({ month, count: monthsMap[month] }));

        // Chart 3: Classification
        const classMap: { [key: string]: number } = {};
        filtered.forEach(c => {
          classMap[c.classification] = (classMap[c.classification] || 0) + 1;
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
}
