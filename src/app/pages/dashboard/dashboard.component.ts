import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { Case, CaseStatus, CaseType } from '../../models/case.model';
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

  constructor(private caseService: CaseService) {}

  ngOnInit() {
    const user = this.caseService.getCurrentUser();
    this.currentUserName = user.name;
    this.currentUserRole = user.role;
    if (this.currentUserRole !== 'SUPER_ADMIN') {
      this.loadDashboardData();
    } else {
      this.loading = false;
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
