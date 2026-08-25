import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';

interface ApprovalRequest {
  name: string;
  email: string;
  staffNo: string;
  department: string;
  date: string;
  requestedRole: string;
  status: string;
  avatarInitials: string;
  avatarClass: string;
}

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.css'
})
export class PendingApprovalsComponent implements OnInit {
  isSuperAdmin = false;

  // Search & Filters
  searchQuery = '';
  selectedRole = 'all';
  selectedStatus = 'Pending';

  // Stats Counters
  awaitingReviewCount = 3;
  approvedCount = 0;
  rejectedCount = 0;

  // Mock list matching prototype details
  approvalsList: ApprovalRequest[] = [
    { name: 'Vhutshilo Sinthumule', email: 'vs&#64;univen.ac.za', staffNo: '31007', department: 'Legal and HR', date: '1 Jun 2026', requestedRole: 'LEGAL_OFFICER', status: 'Pending', avatarInitials: 'VS', avatarClass: 'bg-avatar-blue' },
    { name: 'Ndidzulafhi Baloyi', email: 'nb&#64;univen.ac.za', staffNo: '40234', department: 'Management', date: '31 May 2026', requestedRole: 'VIEWER', status: 'Pending', avatarInitials: 'NB', avatarClass: 'bg-avatar-grey' },
    { name: 'Livhuwani Makhuvha', email: 'lm&#64;univen.ac.za', staffNo: '51923', department: 'Legal and HR', date: '30 May 2026', requestedRole: 'LEGAL_OFFICER', status: 'Pending', avatarInitials: 'LM', avatarClass: 'bg-avatar-green' }
  ];

  constructor(private caseService: CaseService) {}

  ngOnInit() {
    const cur = this.caseService.getCurrentUser();
    this.isSuperAdmin = cur.role === 'SUPER_ADMIN';
  }

  getFilteredApprovals(): ApprovalRequest[] {
    return this.approvalsList.filter(req => {
      const matchesSearch = !this.searchQuery ||
        req.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        req.staffNo.includes(this.searchQuery);

      const matchesRole = this.selectedRole === 'all' || req.requestedRole === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'all' || req.status === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  approveRequest(req: ApprovalRequest) {
    req.status = 'Approved';
    this.awaitingReviewCount = Math.max(0, this.awaitingReviewCount - 1);
    this.approvedCount++;
  }

  rejectRequest(req: ApprovalRequest) {
    req.status = 'Rejected';
    this.awaitingReviewCount = Math.max(0, this.awaitingReviewCount - 1);
    this.rejectedCount++;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedRole = 'all';
    this.selectedStatus = 'Pending';
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'LEGAL_OFFICER': return 'Legal Officer';
      case 'VIEWER': return 'Viewer';
      default: return role;
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'badge-super-admin';
      case 'ADMIN': return 'badge-admin';
      case 'LEGAL_OFFICER': return 'badge-officer';
      case 'VIEWER': return 'badge-viewer';
      default: return '';
    }
  }
}
