import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { User, UserRole } from '../../models/case.model';

export type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'security' | 'system';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  activeTab: SettingsTab = 'profile';
  
  // Current user context
  currentUser!: User;
  isAdmin: boolean = false;

  // Toast feedback state
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | 'info' = 'success';
  private toastTimeout: any;

  // 1. Profile Settings Model
  profileData = {
    name: 'R.E. Mukosi',
    email: 'admin@univen.ac.za',
    title: 'Chief Legal Administrator',
    department: 'Legal Services & Institutional Governance',
    phone: '+27 (0)15 962 8000',
    bio: 'Responsible for oversight of university legal matters, labour relations, arbitration files, and compliance reporting.'
  };

  // 2. Notification Preferences Model
  notificationData = {
    emailNewCases: true,
    emailTrialReminders: true,
    emailStatusUpdates: true,
    emailCaseNotes: false,
    reminderThresholdDays: 7,
    digestFrequency: 'daily',
    inAppSoundAlerts: true,
    browserNotifications: true
  };

  // 3. Appearance Settings Model
  appearanceData = {
    theme: 'dark', // 'dark' | 'light' | 'system'
    density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
    defaultLanding: '/dashboard',
    accentColor: 'blue' // 'blue' | 'gold' | 'emerald' | 'purple'
  };

  // 4. Security Settings Model
  securityData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    sessionTimeoutMinutes: 30,
    loginAlerts: true
  };
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // 5. System Settings Model (Admin level)
  systemData = {
    currency: 'ZAR',
    currencySymbol: 'R',
    casePrefix: 'C',
    autoArchiveMonths: 12,
    defaultExportFormat: 'PDF',
    auditLogging: true,
    requireNoteOnStatusChange: true
  };

  constructor(private caseService: CaseService) {}

  ngOnInit(): void {
    this.currentUser = this.caseService.getCurrentUser();
    this.isAdmin = this.currentUser.role === UserRole.ADMIN;

    if (this.currentUser) {
      this.profileData.name = this.currentUser.name;
      this.profileData.email = this.currentUser.email;
    }
  }

  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
    }, 3500);
  }

  saveProfile(): void {
    if (!this.profileData.name || !this.profileData.email) {
      this.showToast('Please provide both your name and email address.', 'error');
      return;
    }
    this.showToast('Profile information updated successfully!');
  }

  saveNotifications(): void {
    this.showToast('Notification preferences saved successfully!');
  }

  saveAppearance(): void {
    this.showToast(`Appearance saved! Theme set to ${this.appearanceData.theme.toUpperCase()}.`);
  }

  changePassword(): void {
    if (!this.securityData.currentPassword) {
      this.showToast('Please enter your current password.', 'error');
      return;
    }
    if (!this.securityData.newPassword) {
      this.showToast('Please enter a new password.', 'error');
      return;
    }
    if (this.securityData.newPassword.length < 8) {
      this.showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (this.securityData.newPassword !== this.securityData.confirmPassword) {
      this.showToast('New passwords do not match.', 'error');
      return;
    }

    // Reset password fields
    this.securityData.currentPassword = '';
    this.securityData.newPassword = '';
    this.securityData.confirmPassword = '';

    this.showToast('Security credentials and password updated successfully!');
  }

  saveSecuritySettings(): void {
    this.showToast('Security preferences & 2FA settings saved.');
  }

  saveSystemSettings(): void {
    this.showToast('System configuration & case management parameters updated.');
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}
