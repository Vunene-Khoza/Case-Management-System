import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/case.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  currentUser!: User;
  isCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  totalUsersCount = 12;
  pendingApprovalsCount = 3;
  isPreviewMode = false;

  constructor(
    private caseService: CaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.caseService.getCurrentUser();
    this.isPreviewMode = !!localStorage.getItem('original_role');
  }

  exitPreviewMode() {
    const origRole = localStorage.getItem('original_role');
    const origName = localStorage.getItem('original_name');
    const origEmail = localStorage.getItem('original_email');

    if (origRole) {
      localStorage.setItem('user_role', origRole);
      localStorage.removeItem('original_role');
    }
    if (origName) {
      localStorage.setItem('user_name', origName);
      localStorage.removeItem('original_name');
    }
    if (origEmail) {
      localStorage.setItem('user_email', origEmail);
      localStorage.removeItem('original_email');
    }
    localStorage.removeItem('preview_user_id');

    this.router.navigate(['/role-access']).then(() => {
      window.location.reload();
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
