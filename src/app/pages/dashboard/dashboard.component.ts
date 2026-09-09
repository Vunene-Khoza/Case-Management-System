import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { Case, CaseStatus, CaseType, User, UserRole } from '../../models/case.model';
import { ActivityLog } from '../../models/activity-log.model';
import { 
  LucideBriefcase, 
  LucideCheckCircle, 
  LucideAlertCircle, 
  LucideDollarSign, 
  LucideCalendar, 
  LucideEye, 
  LucideArrowRight 
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideBriefcase, 
    LucideCheckCircle, 
    LucideAlertCircle, 
    LucideDollarSign, 
    LucideCalendar, 
    LucideEye, 
    LucideArrowRight
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUserName = '';
  currentUserRole = '';
  loading = true;
  metrics = {
    totalCases: 0,
    openCases: 0,
    closedCases: 0,
    totalCost: 0,
    recentCases: [] as Case[],
    notifications: [] as string[]
  };

  // Super Admin Dynamic Metrics
  saMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalCases: 0,
    pendingApprovals: 3
  };

  roleCounts = {
    SUPER_ADMIN: 0,
    ADMIN: 0,
    LEGAL_OFFICER: 0,
    VIEWER: 0
  };

  recentActivities: ActivityLog[] = [];

  // Base fallback users if none found
  private baseUsers = [
    { name: 'S. Mukosi', email: 'smukosi@univen.ac.za', role: 'SUPER_ADMIN', status: 'Active' },
    { name: 'R.E. Mukosi', email: 'mukosi@univen.ac.za', role: 'ADMIN', status: 'Active' },
    { name: 'T. Avhashoni', email: 'usera@univen.ac.za', role: 'LEGAL_OFFICER', status: 'Active' },
    { name: 'N. Nndivho', email: 'userb@univen.ac.za', role: 'LEGAL_OFFICER', status: 'Active' },
    { name: 'V. Chauke', email: 'viewerc@univen.ac.za', role: 'VIEWER', status: 'Inactive' }
  ];

  constructor(
    private caseService: CaseService,
    private activityLogService: ActivityLogService
  ) {}

  ngOnInit() {
    const user = this.caseService.getCurrentUser();
    this.currentUserName = user.name;
    this.currentUserRole = user.role;
    if (this.currentUserRole === 'SUPER_ADMIN') {
      this.loadSuperAdminDashboardData();
    } else {
      this.loadDashboardData();
    }
  }

  loadSuperAdminDashboardData() {
    this.loading = true;

    // 1. Load users to calculate total, active, inactive, and roles
    this.caseService.getUsers().subscribe({
      next: (backendUsers: User[]) => {
        this.processSuperAdminUsers(backendUsers);
      },
      error: () => {
        this.processSuperAdminUsers([]);
      }
    });

    // 2. Load total cases
    this.caseService.getDashboardSummary().subscribe({
      next: (data) => {
        this.saMetrics.totalCases = data.totalCases || 0;
      },
      error: () => {
        this.saMetrics.totalCases = 0;
      }
    });

    // 3. Load live activity feed
    this.activityLogService.getLogs({
      page: 0,
      size: 5,
      sortBy: 'timestamp',
      sortDir: 'desc'
    }).subscribe({
      next: (page) => {
        this.recentActivities = page.content || [];
        this.loading = false;
      },
      error: () => {
        this.recentActivities = [];
        this.loading = false;
      }
    });
  }

  private processSuperAdminUsers(backendUsers: User[]) {
    let allUsers: Array<{ email: string; role: string; status: string }> = [];

    if (backendUsers && backendUsers.length > 0) {
      allUsers = backendUsers
        .filter(u => u.role !== UserRole.ADMIN || u.firstLoginCompleted)
        .map(u => ({
          email: u.email,
          role: u.role,
          status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
        }));
    }

    // Merge custom users from localStorage
    const customUsersJson = localStorage.getItem('univen_custom_users');
    if (customUsersJson) {
      try {
        const customUsers: User[] = JSON.parse(customUsersJson);
        customUsers.forEach(u => {
          if (u.role === UserRole.ADMIN && u.firstLoginCompleted) {
            const idx = allUsers.findIndex(e => e.email.toLowerCase() === u.email.toLowerCase());
            const userObj = {
              email: u.email,
              role: 'ADMIN',
              status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
            };
            if (idx !== -1) {
              allUsers[idx] = userObj;
            } else {
              allUsers.push(userObj);
            }
          }
        });
      } catch (e) {
        console.error('Error reading custom users in dashboard:', e);
      }
    }

    if (allUsers.length === 0) {
      allUsers = [...this.baseUsers];
    }

    this.saMetrics.totalUsers = allUsers.length;
    this.saMetrics.activeUsers = allUsers.filter(u => u.status === 'Active' || u.status === 'ACTIVE').length;
    this.saMetrics.inactiveUsers = allUsers.filter(u => u.status === 'Inactive' || u.status === 'INACTIVE').length;

    this.roleCounts = {
      SUPER_ADMIN: allUsers.filter(u => u.role === 'SUPER_ADMIN').length,
      ADMIN: allUsers.filter(u => u.role === 'ADMIN' || u.role === UserRole.ADMIN).length,
      LEGAL_OFFICER: allUsers.filter(u => u.role === 'LEGAL_OFFICER' || u.role === UserRole.LEGAL_OFFICER).length,
      VIEWER: allUsers.filter(u => u.role === 'VIEWER' || u.role === UserRole.VIEWER).length
    };
  }

  getRolePercentage(roleKey: keyof typeof this.roleCounts): number {
    if (!this.saMetrics.totalUsers) return 0;
    const count = this.roleCounts[roleKey] || 0;
    return Math.round((count / this.saMetrics.totalUsers) * 100);
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'span-background-color3';
      case 'ADMIN': return 'span-background-color2';
      case 'LEGAL_OFFICER': return 'span-background-color';
      default: return 'span-background-color';
    }
  }

  getRoleBadgeText(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'LEGAL_OFFICER': return 'Officer';
      case 'VIEWER': return 'Viewer';
      default: return role || 'User';
    }
  }

  getActivityIndicatorClass(index: number, status?: string): string {
    if (index === 0) return 'bg-pulse';
    if (status === 'WARNING') return 'bg-gold';
    if (status === 'FAILED') return 'bg-yellow';
    return 'bg-green';
  }

  getRelativeTime(isoString?: string): string {
    if (!isoString) return 'Recently';
    try {
      const time = new Date(isoString).getTime();
      if (isNaN(time)) return isoString;
      const now = Date.now();
      const diffSec = Math.floor((now - time) / 1000);

      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  }

  loadDashboardData() {
    this.loading = true;
    this.caseService.getDashboardSummary().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatCost(val: number): string {
    return val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getCaseTypeClass(type: CaseType): string {
    return type === CaseType.LEGAL ? 'badge-legal' : 'badge-labour';
  }

  getStatusClass(status: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return 'badge-open';
      case CaseStatus.IN_PROGRESS: return 'badge-in-progress';
      case CaseStatus.CLOSED: return 'badge-closed';
      default: return '';
    }
  }

  formatStatusLabel(status: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return 'Open';
      case CaseStatus.IN_PROGRESS: return 'In Progress';
      case CaseStatus.CLOSED: return 'Closed';
      default: return status;
    }
  }
}
