import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CaseService } from '../../services/case.service';

interface SwitchHistory {
  timestamp: string;
  switchedTo: string;
  badgeClass: string;
  duration: string;
  actionsTaken: string;
}

@Component({
  selector: 'app-role-access',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-access.component.html',
  styleUrl: './role-access.component.css'
})
export class RoleAccessComponent implements OnInit {
  isSuperAdmin = false;

  historyList: SwitchHistory[] = [
    { timestamp: '2026-05-28 · 09:45', switchedTo: 'Admin View', badgeClass: 'badge-admin', duration: '12 min', actionsTaken: 'Reviewed user management screen' },
    { timestamp: '2026-05-22 · 14:10', switchedTo: 'Legal Officer View', badgeClass: 'badge-officer', duration: '8 min', actionsTaken: 'Inspected case creation form' },
    { timestamp: '2026-05-15 · 11:30', switchedTo: 'Viewer View', badgeClass: 'badge-viewer', duration: '5 min', actionsTaken: 'Checked reports accessibility' }
  ];

  constructor(
    private router: Router,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    const cur = this.caseService.getCurrentUser();
    // Support either real SUPER_ADMIN or preview state to view this page
    const original = localStorage.getItem('original_role');
    this.isSuperAdmin = cur.role === 'SUPER_ADMIN' || original === 'SUPER_ADMIN';
  }

  switchToRole(role: string) {
    const currentRole = localStorage.getItem('user_role') || 'SUPER_ADMIN';
    
    // Save original role as super admin if we are switching away from super admin
    if (currentRole === 'SUPER_ADMIN' && !localStorage.getItem('original_role')) {
      localStorage.setItem('original_role', 'SUPER_ADMIN');
    }

    localStorage.setItem('user_role', role);
    
    // Add item to history log
    const roleLabel = this.getRoleLabel(role);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.historyList.unshift({
      timestamp: formattedDate,
      switchedTo: `${roleLabel} View`,
      badgeClass: this.getRoleBadgeClass(role),
      duration: 'Just now',
      actionsTaken: `Started simulated preview session as ${roleLabel}`
    });

    // Navigate to dashboard and refresh to load the new simulated workspace role layout
    this.router.navigate(['/dashboard']).then(() => {
      window.location.reload();
    });
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
