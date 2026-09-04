import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  isSuperAdmin = false;
  UserRole = UserRole;

  // Super Admin state controls
  searchQuery = '';
  selectedRole = 'all';
  selectedStatus = 'all';

  dummyUsers: Array<{
    name: string;
    email: string;
    staffNo: string;
    role: string;
    department: string;
    lastLogin: string;
    status: string;
  }> = [];

  // Base system users across all roles
  baseUsers = [
    { name: 'S. Mukosi', email: 'smukosi@univen.ac.za', staffNo: '00001', role: 'SUPER_ADMIN', department: 'IT / Legal', lastLogin: 'Today · 07:45', status: 'Active' },
    { name: 'R.E. Mukosi', email: 'mukosi@univen.ac.za', staffNo: '10012', role: 'ADMIN', department: 'Legal and HR', lastLogin: 'Today · 08:14', status: 'Active' },
    { name: 'T. Avhashoni', email: 'usera@univen.ac.za', staffNo: '12345', role: 'LEGAL_OFFICER', department: 'Legal and HR', lastLogin: 'Yesterday · 16:35', status: 'Active' },
    { name: 'N. Nndivho', email: 'userb@univen.ac.za', staffNo: '22810', role: 'LEGAL_OFFICER', department: 'Legal and HR', lastLogin: '1 Jun · 10:12', status: 'Active' },
    { name: 'V. Chauke', email: 'viewerc@univen.ac.za', staffNo: '40234', role: 'VIEWER', department: 'Management', lastLogin: '28 May', status: 'Inactive' }
  ];

  // Add User Form controls
  showAddModal = false;
  formData = {
    name: '',
    email: '',
    role: UserRole.LEGAL_OFFICER
  };

  constructor(
    private caseService: CaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const cur = this.caseService.getCurrentUser();
    this.currentUserId = cur.userId;
    this.isSuperAdmin = cur.role === 'SUPER_ADMIN';
    this.isAdmin = cur.role === UserRole.ADMIN || this.isSuperAdmin;
    
    this.loadSuperAdminUsers();

    if (this.isAdmin && !this.isSuperAdmin) {
      this.loadUsers();
    }

    // Check for route path matching to trigger auto-actions
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.map(segment => segment.path).join('/');
      if (path === 'create') {
        this.openAddModal();
      } else if (path === 'pending') {
        this.selectedStatus = 'Inactive';
      }
    });
  }

  loadSuperAdminUsers() {
    this.dummyUsers = [...this.baseUsers];

    // Load any custom provisioned Admins that have completed their first-time password setup and login
    const customUsersJson = localStorage.getItem('univen_custom_users');
    if (customUsersJson) {
      try {
        const customUsers: User[] = JSON.parse(customUsersJson);
        customUsers.forEach(u => {
          // Requirement: Admin account appears in User Management list once first-time password change is completed
          if (u.role === UserRole.ADMIN && u.firstLoginCompleted) {
            const alreadyExists = this.dummyUsers.some(existing => existing.email.toLowerCase() === u.email.toLowerCase());
            if (!alreadyExists) {
              this.dummyUsers.push({
                name: u.name,
                email: u.email,
                staffNo: u.staffNumber || '10099',
                role: 'ADMIN',
                department: u.department || 'Legal and HR',
                lastLogin: u.lastLogin || 'Today · Just now',
                status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
              });
            }
          }
        });
      } catch (e) {
        console.error('Error parsing custom users from localStorage', e);
      }
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

  getAvatarBgClass(name: string): string {
    if (!name) return 'bg-avatar-blue';
    const firstLetter = name[0].toUpperCase();
    if (firstLetter < 'G') return 'bg-avatar-blue';
    if (firstLetter < 'N') return 'bg-avatar-green';
    if (firstLetter < 'U') return 'bg-avatar-gold';
    return 'bg-avatar-grey';
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'role-superadmin';
      case UserRole.ADMIN: return 'role-admin';
      case UserRole.LEGAL_OFFICER: return 'role-officer';
      case UserRole.VIEWER: return 'role-viewer';
      default: return '';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case UserRole.ADMIN: return 'Administrator';
      case UserRole.LEGAL_OFFICER: return 'Legal Officer';
      case UserRole.VIEWER: return 'Viewer';
      default: return role;
    }
  }

  // Super Admin actions
  getFilteredDummyUsers() {
    return this.dummyUsers.filter(u => {
      const matchesSearch = !this.searchQuery || 
        u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        u.staffNo.includes(this.searchQuery);
        
      const matchesRole = this.selectedRole === 'all' || u.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'all' || u.status === this.selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedRole = 'all';
    this.selectedStatus = 'all';
  }

  exportUsers() {
    alert('User Directory exported successfully as CSV.');
  }

  // Modal Actions
  openAddModal() {
    if (this.isSuperAdmin) {
      this.router.navigate(['/users/create']);
      return;
    }
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
    
    if (this.isSuperAdmin) {
      // Add user to the dummy users list for Super Admin simulation
      const mockStaffNo = Math.floor(10000 + Math.random() * 90000).toString();
      this.dummyUsers.push({
        name: this.formData.name,
        email: this.formData.email,
        staffNo: mockStaffNo,
        role: this.formData.role,
        department: this.formData.role === UserRole.ADMIN ? 'Legal and HR' : 'Legal and HR',
        lastLogin: 'Never logged in',
        status: 'Active'
      });
      this.closeAddModal();
      return;
    }

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
