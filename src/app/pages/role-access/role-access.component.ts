import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { User } from '../../models/case.model';

export interface SwitchHistory {
  timestamp: string;
  switchedTo: string;
  badgeClass: string;
  duration: string;
  actionsTaken: string;
}

@Component({
  selector: 'app-role-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-access.component.html',
  styleUrl: './role-access.component.css'
})
export class RoleAccessComponent implements OnInit {
  isSuperAdmin = false;

  // Dynamic Role Counts
  roleCounts = {
    adminCount: 0,
    legalOfficerCount: 0,
    viewerCount: 0
  };
  isLoadingCounts = false;

  // Account Selection Modal
  isModalOpen = false;
  selectedRole: string = '';
  roleUsers: User[] = [];
  filteredRoleUsers: User[] = [];
  isLoadingUsers = false;
  searchQuery = '';

  // History List
  historyList: SwitchHistory[] = [];
  isLoadingHistory = false;

  constructor(
    private router: Router,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    const cur = this.caseService.getCurrentUser();
    const original = localStorage.getItem('original_role');
    this.isSuperAdmin = cur.role === 'SUPER_ADMIN' || original === 'SUPER_ADMIN';

    this.loadRoleCounts();
    this.loadHistory();
  }

  loadRoleCounts() {
    this.isLoadingCounts = true;
    this.caseService.getRoleCounts().subscribe({
      next: (counts) => {
        if (counts) {
          this.roleCounts = counts;
        }
        this.isLoadingCounts = false;
      },
      error: () => {
        this.isLoadingCounts = false;
      }
    });
  }

  loadHistory() {
    this.isLoadingHistory = true;
    this.caseService.getRoleSwitchHistory().subscribe({
      next: (data) => {
        this.historyList = data || [];
        this.isLoadingHistory = false;
      },
      error: () => {
        this.isLoadingHistory = false;
      }
    });
  }

  openRoleModal(role: string) {
    this.selectedRole = role;
    this.searchQuery = '';
    this.isModalOpen = true;
    this.isLoadingUsers = true;
    this.roleUsers = [];
    this.filteredRoleUsers = [];

    this.caseService.getUsersByRole(role).subscribe({
      next: (users) => {
        this.roleUsers = users || [];
        this.filterUsers();
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  closeRoleModal() {
    this.isModalOpen = false;
    this.selectedRole = '';
    this.roleUsers = [];
    this.filteredRoleUsers = [];
    this.searchQuery = '';
  }

  onSearchChange() {
    this.filterUsers();
  }

  filterUsers() {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) {
      this.filteredRoleUsers = [...this.roleUsers];
      return;
    }
    this.filteredRoleUsers = this.roleUsers.filter(u => {
      const nameMatch = (u.name || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const staffMatch = (u.staffNumber || '').toLowerCase().includes(q);
      const deptMatch = (u.department || '').toLowerCase().includes(q);
      return nameMatch || emailMatch || staffMatch || deptMatch;
    });
  }

  selectUserToSwitch(user: User) {
    const curUser = this.caseService.getCurrentUser();

    // Preserve original Super Admin credentials if not already saved
    if (!localStorage.getItem('original_role')) {
      localStorage.setItem('original_role', curUser.role || 'SUPER_ADMIN');
      localStorage.setItem('original_name', curUser.name || 'System Super Admin');
      localStorage.setItem('original_email', curUser.email || 'superadmin@univen.ac.za');
    }

    // Set new active session credentials
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('user_name', user.name);
    localStorage.setItem('user_email', user.email);
    localStorage.setItem('preview_user_id', user.userId);

    const roleLabel = this.getRoleLabel(user.role);
    const actionsDesc = `Super Admin previewing workspace as ${user.name} (${roleLabel})`;

    this.caseService.logRoleSwitch({
      targetUserId: user.userId,
      targetUserName: user.name,
      targetUserEmail: user.email,
      targetRole: user.role,
      actionsTaken: actionsDesc
    }).subscribe(() => {
      this.closeRoleModal();
      this.router.navigate(['/dashboard']).then(() => {
        window.location.reload();
      });
    });
  }

  getRoleModalTitle(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Select an Administrator Account';
      case 'LEGAL_OFFICER': return 'Select a Legal Officer Account';
      case 'VIEWER': return 'Select a Viewer Account';
      default: return 'Select User Account';
    }
  }

  getRoleModalSubtitle(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Choose an Administrator account below to inspect system management, users, and administrative workflows.';
      case 'LEGAL_OFFICER':
        return 'Choose a Legal Officer account below to inspect case handling, court dates, notes, and closure actions.';
      case 'VIEWER':
        return 'Choose a Viewer account below to inspect read-only access across reports and legal case summaries.';
      default:
        return 'Choose an account below to preview their experience and permissions.';
    }
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

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
