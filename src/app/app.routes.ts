import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CasesListComponent } from './pages/cases-list/cases-list.component';
import { CaseFormComponent } from './pages/case-form/case-form.component';
import { CaseDetailsComponent } from './pages/case-details/case-details.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'cases', component: CasesListComponent },
  { path: 'cases/create', component: CaseFormComponent },
  { path: 'cases/:id', component: CaseDetailsComponent },
  { path: 'cases/:id/edit', component: CaseFormComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'users', component: UserManagementComponent },
  { path: '**', redirectTo: 'dashboard' }
];
