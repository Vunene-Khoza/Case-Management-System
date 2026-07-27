import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { User, UserRole } from '../../models/case.model';
import { 
  LucidePlus, 
  LucideTrash2, 
  LucideEdit2, 
  LucideShieldAlert, 
  LucideCheck, 
  LucideMail, 
  LucideUserCheck,
  LucideX
} from '@lucide/angular';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucidePlus, 
    LucideTrash2, 
    LucideEdit2, 
    LucideShieldAlert, 
    LucideCheck, 
    LucideMail, 
    LucideUserCheck,
    LucideX
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentUserId = '';
  isAdmin = false;
  UserRole = UserRole;

  // Add User Form controls
  showAddModal = false;
  formData = {
    name: '',
    email: '',
    role: UserRole.LEGAL_OFFICER
  };

  constructor(private caseService: CaseService) {}

  ngOnInit() {
    const cur = this.caseService.getCurrentUser();
    this.currentUserId = cur.userId;
    this.isAdmin = cur.role === UserRole.ADMIN;
    
    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.caseService.getUsers().subscribe((list: User[]) => {
      this.users = list;
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'role-admin';
      case UserRole.LEGAL_OFFICER: return 'role-officer';
      case UserRole.VIEWER: return 'role-viewer';
      default: return '';
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'Administrator';
      case UserRole.LEGAL_OFFICER: return 'Legal Officer';
      case UserRole.VIEWER: return 'Viewer';
      default: return role;
    }
  }

  // Modal Actions
  openAddModal() {
    this.showAddModal = true;
    this.formData = {
      name: '',
      email: '',
      role: UserRole.LEGAL_OFFICER
    };
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  submitUserForm() {
    if (!this.formData.name || !this.formData.email) return;
    this.caseService.addUser({
      name: this.formData.name,
      email: this.formData.email,
      role: this.formData.role
    }).subscribe({
      next: (newUser: User) => {
        this.users.push(newUser);
        this.closeAddModal();
      },
      error: (err: any) => {
        alert(err.message || 'Failed to create user account.');
      }
    });
  }

  deleteUser(user: User) {
    const confirmDelete = confirm(`Are you sure you want to delete ${user.name}'s account? They will lose access immediately.`);
    if (confirmDelete) {
      this.caseService.deleteUser(user.userId).subscribe(() => {
        this.users = this.users.filter(u => u.userId !== user.userId);
      });
    }
  }

  goBack() {
    window.history.back();
  }
}
