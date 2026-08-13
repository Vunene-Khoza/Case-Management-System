import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActivityLogService } from '../../services/activity-log.service';
import { ActivityLog, ActivityCategory, ActivityStatus } from '../../models/activity-log.model';
import {
  LucideActivity,
  LucideSearch,
  LucideDownload,
  LucideShieldAlert,
  LucideUserCheck,
  LucideBriefcase,
  LucideSettings,
  LucideFileText,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideXCircle,
  LucideList,
  LucideClock,
  LucideZap,
  LucideTrash2,
  LucideX,
  LucideEye,
  LucideInfo
} from '@lucide/angular';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideActivity,
    LucideSearch,
    LucideDownload,
    LucideShieldAlert,
    LucideUserCheck,
    LucideBriefcase,
    LucideSettings,
    LucideFileText,
    LucideCheckCircle2,
    LucideAlertTriangle,
    LucideXCircle,
    LucideList,
    LucideClock,
    LucideZap,
    LucideTrash2,
    LucideX,
    LucideEye,
    LucideInfo
  ],
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.css'
})
export class ActivityLogComponent implements OnInit, OnDestroy {
  Math = Math;
  activities: ActivityLog[] = [];
  filteredActivities: ActivityLog[] = [];
  private logSub!: Subscription;

  // Filter state
  searchQuery: string = '';
  selectedCategory: string = 'ALL';
  selectedStatus: string = 'ALL';
  viewMode: 'timeline' | 'table' = 'timeline';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;

  // Selected Log Modal
  selectedLogModal: ActivityLog | null = null;
  toastMessage: string | null = null;

  // Categories list for filter tabs
  categories = [
    { key: 'ALL', label: 'All Activities' },
    { key: ActivityCategory.CASE, label: 'Case Management' },
    { key: ActivityCategory.USER, label: 'User & Accounts' },
    { key: ActivityCategory.SECURITY, label: 'Security & Access' },
    { key: ActivityCategory.SYSTEM, label: 'System Settings' },
    { key: ActivityCategory.REPORT, label: 'Reports & Exports' }
  ];

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.logSub = this.activityLogService.logs$.subscribe(logs => {
      this.activities = logs;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    if (this.logSub) {
      this.logSub.unsubscribe();
    }
  }

  // Summary Metrics
  get totalLogsCount(): number {
    return this.activities.length;
  }

  get caseLogsCount(): number {
    return this.activities.filter(a => a.category === ActivityCategory.CASE).length;
  }

  get securityAlertsCount(): number {
    return this.activities.filter(a => a.category === ActivityCategory.SECURITY).length;
  }

  get failedCount(): number {
    return this.activities.filter(a => a.status === 'FAILED' || a.status === 'WARNING').length;
  }

  // Filter logic
  applyFilters(): void {
    let result = [...this.activities];

    // Search query (matches description, user, action, case ID, IP)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(a =>
        a.description.toLowerCase().includes(q) ||
        a.userName.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.ipAddress.includes(q) ||
        (a.entityId && a.entityId.toLowerCase().includes(q))
      );
    }

    // Category Filter
    if (this.selectedCategory !== 'ALL') {
      result = result.filter(a => a.category === this.selectedCategory);
    }

    // Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter(a => a.status === this.selectedStatus);
    }

    this.filteredActivities = result;
    this.currentPage = 1; // Reset to page 1 on filter change
  }

  // Pagination calculation
  get totalPages(): number {
    return Math.ceil(this.filteredActivities.length / this.itemsPerPage) || 1;
  }

  get paginatedActivities(): ActivityLog[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredActivities.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Time formatters
  getRelativeTime(isoString: string): string {
    const time = new Date(isoString).getTime();
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
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // UI styling helpers
  getCategoryColorClass(category: ActivityCategory | string): string {
    switch (category) {
      case ActivityCategory.CASE: return 'cat-case';
      case ActivityCategory.USER: return 'cat-user';
      case ActivityCategory.SECURITY: return 'cat-security';
      case ActivityCategory.SYSTEM: return 'cat-system';
      case ActivityCategory.REPORT: return 'cat-report';
      default: return 'cat-default';
    }
  }

  getStatusBadgeClass(status: ActivityStatus): string {
    switch (status) {
      case 'SUCCESS': return 'status-success';
      case 'WARNING': return 'status-warning';
      case 'FAILED': return 'status-failed';
      default: return '';
    }
  }

  // Actions
  simulateLiveEvent(): void {
    this.activityLogService.simulateEvent();
    this.showToast('New live audit log event recorded!');
  }

  clearLogs(): void {
    if (confirm('Are you sure you want to clear all current audit log records?')) {
      this.activityLogService.clearLogs();
      this.showToast('Audit log history cleared.');
    }
  }

  openModal(log: ActivityLog): void {
    this.selectedLogModal = log;
  }

  closeModal(): void {
    this.selectedLogModal = null;
  }

  exportToCsv(): void {
    if (this.filteredActivities.length === 0) {
      this.showToast('No logs available to export.');
      return;
    }

    const headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Category', 'Action', 'Entity ID', 'Description', 'IP Address', 'Status'];
    const rows = this.filteredActivities.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      l.category,
      l.action,
      l.entityId || '',
      `"${l.description.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `activity_audit_log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Audit log exported to CSV spreadsheet successfully.');
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  getObjectKeys(obj: Record<string, any> | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
