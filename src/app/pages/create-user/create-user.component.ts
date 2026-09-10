import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { UniversityEmployee, UserRole } from '../../models/case.model';

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
  isAdmin = false;

  // Search by Employee Number
  searchEmployeeNumber = '';
  isSearching = false;
  employeeFound = false;
  searchError = '';

  // Auto-populated Employee Details (Read-only)
  name = '';
  surname = '';
  employeeNumber = '';
  email = '';
  phoneNumber = '';
  idNumber = '';
  department = '';

  // Fixed Role & Account Status
  assignedRole: UserRole = UserRole.ADMIN;
  accountStatus = 'ACTIVE';

  // Temporary Password Entry
  tempPassword = '';
  confirmPassword = '';

  // Validation messages
  errorMessage = '';
  successMessage = '';

  // Quick suggestions for staff lookup
  sampleStaffNumbers = ['10012', '12345', '31007', '40234', '51923', '60114', '71205', '82341', '93452', '24563', '35674'];

  constructor(
    private router: Router,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    const cur = this.caseService.getCurrentUser();
    this.isSuperAdmin = cur.role === 'SUPER_ADMIN';
    this.isAdmin = cur.role === 'ADMIN';

    // If caller is Admin, lock role strictly to LEGAL_OFFICER (cannot create Viewers or Admins)
    if (this.isAdmin) {
      this.assignedRole = UserRole.LEGAL_OFFICER;
    } else {
      this.assignedRole = UserRole.ADMIN;
    }
  }

  onSearchEmployee(sampleNumber?: string) {
    if (sampleNumber) {
      this.searchEmployeeNumber = sampleNumber;
    }

    this.searchError = '';
    this.errorMessage = '';
    const query = this.searchEmployeeNumber.trim();

    if (!query) {
      this.searchError = 'No official University of Venda employee found for Staff Number "". Please verify employee records.';
      this.employeeFound = false;
      this.clearPopulatedFields();
      return;
    }

    this.isSearching = true;
    this.caseService.searchEmployeeByNumber(query).subscribe({
      next: (emp: UniversityEmployee | null) => {
        this.isSearching = false;
        if (emp) {
          this.employeeFound = true;
          this.name = emp.name;
          this.surname = emp.surname;
          this.employeeNumber = emp.employeeNumber;
          this.email = emp.email;
          this.phoneNumber = emp.phoneNumber;
          this.idNumber = emp.idNumber;
          this.department = emp.department;
          this.searchError = '';
        } else {
          this.employeeFound = false;
          this.searchError = `No official University of Venda employee found for Staff Number "${query}". Please verify employee records.`;
          this.clearPopulatedFields();
        }
      },
      error: () => {
        this.isSearching = false;
        this.searchError = 'Error connecting to University employee directory.';
      }
    });
  }

  clearPopulatedFields() {
    this.name = '';
    this.surname = '';
    this.employeeNumber = '';
    this.email = '';
    this.phoneNumber = '';
    this.idNumber = '';
    this.department = '';
  }

  getRoleTitle(): string {
    return this.isSuperAdmin ? 'Administrator' : 'Legal Officer';
  }

  getRoleDescription(): string {
    if (this.isSuperAdmin) {
      return 'Admins manage university cases, view institutional reports, and support operational workflows. Admins must be verified Univen staff with an official @univen.ac.za email.';
    }
    return 'Legal Officers manage active cases, track trial dates, record official notes, and submit matters for closure. Legal Officers must be verified Univen staff with an official @univen.ac.za email.';
  }

  getRolePermissions(): RolePermission[] {
    if (this.isSuperAdmin) {
      return [
        { name: 'Full system case visibility', allowed: true },
        { name: 'Update & edit registered cases', allowed: true },
        { name: 'Add official case notes', allowed: true },
        { name: 'Update trial & reminder dates', allowed: true },
        { name: 'Close resolved cases', allowed: true },
        { name: 'Access comprehensive reports', allowed: true },
        { name: 'Global Super Admin configuration', allowed: false }
      ];
    }
    return [
      { name: 'Create & manage assigned cases', allowed: true },
      { name: 'Add official case notes & history', allowed: true },
      { name: 'Schedule hearing & reminder dates', allowed: true },
      { name: 'Submit matters for administrative closure', allowed: true },
      { name: 'Access case reports & summaries', allowed: true },
      { name: 'User management & system provisioning', allowed: false }
    ];
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    const targetRoleName = this.isSuperAdmin ? 'Admin' : 'Legal Officer';

    if (!this.employeeFound) {
      this.errorMessage = `Please search and select a valid University employee before creating the ${targetRoleName} account.`;
      return;
    }

    if (!this.tempPassword || !this.confirmPassword) {
      this.errorMessage = `Please provide and confirm a temporary password for the new ${targetRoleName}.`;
      return;
    }

    if (this.tempPassword.length < 8) {
      this.errorMessage = 'Temporary password must be at least 8 characters long.';
      return;
    }

    if (this.tempPassword !== this.confirmPassword) {
      this.errorMessage = 'Temporary passwords do not match.';
      return;
    }

    const payload = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      staffNumber: this.employeeNumber,
      phoneNumber: this.phoneNumber,
      idNumber: this.idNumber,
      department: this.department,
      role: this.assignedRole,
      temporaryPassword: this.tempPassword
    };

    const creationObservable = this.isSuperAdmin
      ? this.caseService.createAdminUser(payload)
      : this.caseService.createLegalOfficerUser(payload);

    creationObservable.subscribe({
      next: () => {
        this.successMessage = `${targetRoleName} account for ${this.name} ${this.surname} (${this.email}) created successfully! The user must complete their first-time password setup upon login.`;
        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage = err?.message || `Failed to create ${targetRoleName} account.`;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/users']);
  }
}
