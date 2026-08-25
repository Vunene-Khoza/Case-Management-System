import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CasesListComponent } from './pages/cases-list/cases-list.component';
import { CaseFormComponent } from './pages/case-form/case-form.component';
import { CaseDetailsComponent } from './pages/case-details/case-details.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ActivityLogComponent } from './pages/activity-log/activity-log.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { authGuard } from './guards/auth.guard';

import { PendingApprovalsComponent } from './pages/pending-approvals/pending-approvals.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { RoleAccessComponent } from './pages/role-access/role-access.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'cases', component: CasesListComponent, canActivate: [authGuard] },
  { path: 'cases/create', component: CaseFormComponent, canActivate: [authGuard] },
  { path: 'cases/:id', component: CaseDetailsComponent, canActivate: [authGuard] },
  { path: 'cases/:id/edit', component: CaseFormComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard] },
  { path: 'users/create', component: CreateUserComponent, canActivate: [authGuard] },
  { path: 'users/pending', component: PendingApprovalsComponent, canActivate: [authGuard] },
  { path: 'role-access', component: RoleAccessComponent, canActivate: [authGuard] },
  { path: 'activity-log', component: ActivityLogComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];

