import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseService } from '../../services/case.service';

interface RolePermission {
  name: string;
  allowed: boolean;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {
  isSuperAdmin = false;

  // Form Fields
  fullName = '';
  staffNumber = '';
  email = '';
  department = '';
  assignedRole = 'LEGAL_OFFICER';
  accountStatus = 'ACTIVE';
  tempPassword = '';
  confirmPassword = '';

  // Validation message
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    const cur = this.caseService.getCurrentUser();
    this.isSuperAdmin = cur.role === 'SUPER_ADMIN';
  }

  getRoleDescription(): string {
    switch (this.assignedRole) {
      case 'SUPER_ADMIN':
        return 'Super Admins have full access across the entire platform, including global dashboard metrics, audit logs, system configurations, and user management controls.';
      case 'ADMIN':
        return 'Admins can manage cases and run reports, but have restricted access to global system logs, user directory administration, and backend configurations.';
      case 'LEGAL_OFFICER':
        return 'Legal Officers can create, manage, and close cases, add notes, and track dates. They cannot access user management or system settings.';
      case 'VIEWER':
        return 'Viewers have read-only access to view cases, schedules, and reports. They cannot create or modify cases, add notes, or access settings.';
      default:
        return '';
    }
  }

  getRolePermissions(): RolePermission[] {
    const isSA = this.assignedRole === 'SUPER_ADMIN';
    const isAdmin = this.assignedRole === 'ADMIN';
    const isLO = this.assignedRole === 'LEGAL_OFFICER';
    
    return [
      { name: 'Create new cases', allowed: isSA || isAdmin || isLO },
      { name: 'Update & edit cases', allowed: isSA || isAdmin || isLO },
      { name: 'Add notes to cases', allowed: isSA || isAdmin || isLO },
      { name: 'Update trial dates', allowed: isSA || isAdmin || isLO },
      { name: 'Close cases', allowed: isSA || isAdmin || isLO },
      { name: 'User management', allowed: isSA },
      { name: 'Full reports access', allowed: isSA || isAdmin }
    ];
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

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fullName || !this.staffNumber || !this.email || !this.tempPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields marked with *';
      return;
    }

    if (!this.email.endsWith('@univen.ac.za')) {
      this.errorMessage = 'Institutional email must end with @univen.ac.za';
      return;
    }

    if (this.tempPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Success Simulation
    this.successMessage = 'User account created successfully!';
    setTimeout(() => {
      this.router.navigate(['/users']);
    }, 1500);
  }

  onCancel() {
    this.router.navigate(['/users']);
  }
}
