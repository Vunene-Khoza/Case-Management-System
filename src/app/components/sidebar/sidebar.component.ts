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

  constructor(
    private caseService: CaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.caseService.getCurrentUser();
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
