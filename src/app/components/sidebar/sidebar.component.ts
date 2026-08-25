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
    const orig = localStorage.getItem('original_role');
    if (orig) {
      localStorage.setItem('user_role', orig);
      localStorage.removeItem('original_role');
    }
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
