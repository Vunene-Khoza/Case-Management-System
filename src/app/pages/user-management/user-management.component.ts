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

  // Pagination controls
  Math = Math;
  currentPage = 1;
  pageSize = 5;

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
    this.caseService.getUsers().subscribe({
      next: (backendUsers: User[]) => {
        let allUsersList: any[] = [];

        if (backendUsers && backendUsers.length > 0) {
          allUsersList = backendUsers
            .filter(u => u.role !== UserRole.ADMIN || u.firstLoginCompleted)
            .map(u => ({
              name: u.name,
              email: u.email,
              staffNo: u.staffNumber || '00000',
              role: u.role,
              department: u.department || 'Department of Legal Services',
              lastLogin: this.formatLastLogin(u.lastLogin),
              status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
            }));
        }

        // Merge any custom created Admins from localStorage that completed first login
        const customUsersJson = localStorage.getItem('univen_custom_users');
        if (customUsersJson) {
          try {
            const customUsers: User[] = JSON.parse(customUsersJson);
            customUsers.forEach(u => {
              if (u.role === UserRole.ADMIN && u.firstLoginCompleted) {
                const idx = allUsersList.findIndex(existing => existing.email.toLowerCase() === u.email.toLowerCase());
                const userObj = {
                  name: u.name,
                  email: u.email,
                  staffNo: u.staffNumber || '10012',
                  role: 'ADMIN',
                  department: u.department || 'Department of Legal Services',
                  lastLogin: this.formatLastLogin(u.lastLogin) || 'Today · Just now',
                  status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
                };
                if (idx !== -1) {
                  allUsersList[idx] = userObj;
                } else {
                  allUsersList.push(userObj);
                }
              }
            });
          } catch (e) {
            console.error('Error reading custom users from localStorage:', e);
          }
        }

        if (allUsersList.length === 0) {
          this.dummyUsers = [...this.baseUsers];
        } else {
          this.dummyUsers = allUsersList;
        }
      },
      error: () => {
        this.fallbackToLocalStorageAndBase();
      }
    });
  }

  private fallbackToLocalStorageAndBase() {
    let list = [...this.baseUsers];
    const customUsersJson = localStorage.getItem('univen_custom_users');
    if (customUsersJson) {
      try {
        const customUsers: User[] = JSON.parse(customUsersJson);
        customUsers.forEach(u => {
          if (u.role === UserRole.ADMIN && u.firstLoginCompleted) {
            const idx = list.findIndex(existing => existing.email.toLowerCase() === u.email.toLowerCase());
            const userObj = {
              name: u.name,
              email: u.email,
              staffNo: u.staffNumber || '10012',
              role: 'ADMIN',
              department: u.department || 'Department of Legal Services',
              lastLogin: this.formatLastLogin(u.lastLogin) || 'Today · Just now',
              status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
            };
            if (idx !== -1) {
              list[idx] = userObj;
            } else {
              list.push(userObj);
            }
          }
        });
      } catch (e) {
        console.error('Error reading custom users from localStorage:', e);
      }
    }
    this.dummyUsers = list;
  }

  formatLastLogin(lastLogin?: string): string {
    if (!lastLogin) return 'Never logged in';
    if (!lastLogin.includes('T') && !lastLogin.includes('-')) return lastLogin;
    try {
      const d = new Date(lastLogin);
      if (isNaN(d.getTime())) return lastLogin;
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return isToday ? `Today · ${time}` : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return lastLogin;
    }
  }

  loadUsers() {
    this.caseService.getUsers().subscribe({
      next: (list: User[]) => {
        if (list && list.length > 0) {
          this.users = list;
        } else {
          this.loadAdminFallbackUsers();
        }
      },
      error: () => {
        this.loadAdminFallbackUsers();
      }
    });
  }

  private loadAdminFallbackUsers() {
    const cur = this.caseService.getCurrentUser();
    const curEmail = (cur.email || '').toLowerCase();
    const customUsersJson = localStorage.getItem('univen_custom_users');
    if (customUsersJson) {
      try {
        const customUsers: User[] = JSON.parse(customUsersJson);
        this.users = customUsers.filter(u => 
          u.createdBy && u.createdBy.toLowerCase() === curEmail
        );
      } catch (e) {
        this.users = [];
      }
    } else {
      this.users = [];
    }
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

  get totalFilteredCount(): number {
    return this.getFilteredDummyUsers().length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredCount / this.pageSize));
  }

  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.getFilteredDummyUsers().slice(start, start + this.pageSize);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
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

  onFilterChange(): void {
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedRole = 'all';
    this.selectedStatus = 'all';
    this.currentPage = 1;
  }

  exportUsers() {
    alert('User Directory exported successfully as CSV.');
  }

  // User Creation Action
  openAddModal() {
    this.router.navigate(['/users/create']);
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
