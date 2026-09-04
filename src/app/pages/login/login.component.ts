import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  LucideUser,
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucideHelpCircle,
  LucideInfo,
  LucideX,
  LucideZap,
  LucidePhoneCall,
  LucidePhone,
  LucideMail,
  LucideBookOpen
} from '@lucide/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideUser,
    LucideLock,
    LucideEye,
    LucideEyeOff,
    LucideHelpCircle,
    LucideInfo,
    LucideX,
    LucideZap,
    LucidePhoneCall,
    LucidePhone,
    LucideMail,
    LucideBookOpen
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  // Modals Visibility Controls
  showHelpModal = false;
  showResetPasswordModal = false;
  showChangePasswordModal = false;

  // Form binds
  resetEmailAddress = '';
  successMessage = '';

  // First-Time Password Change Form
  changePasswordUserEmail = '';
  firstTimeCurrentPassword = '';
  firstTimeNewPassword = '';
  firstTimeConfirmPassword = '';
  changePasswordError = '';
  isChangingPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          if (response.data.mustChangePassword) {
            this.changePasswordUserEmail = response.data.email;
            this.firstTimeCurrentPassword = this.password;
            this.firstTimeNewPassword = '';
            this.firstTimeConfirmPassword = '';
            this.changePasswordError = '';
            this.showChangePasswordModal = true;
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.errorMessage = response.message || 'Login failed. Please check credentials.';
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.errorMessage = err.error?.message || 'Connection to the authentication server failed.';
      }
    });
  }

  submitFirstTimePasswordChange() {
    this.changePasswordError = '';
    if (!this.firstTimeCurrentPassword || !this.firstTimeNewPassword || !this.firstTimeConfirmPassword) {
      this.changePasswordError = 'Please complete all password fields.';
      return;
    }

    if (this.firstTimeNewPassword.length < 8) {
      this.changePasswordError = 'New password must be at least 8 characters long.';
      return;
    }

    if (this.firstTimeNewPassword !== this.firstTimeConfirmPassword) {
      this.changePasswordError = 'New password and confirmation do not match.';
      return;
    }

    if (this.firstTimeNewPassword === this.firstTimeCurrentPassword) {
      this.changePasswordError = 'New password cannot be the same as the temporary password.';
      return;
    }

    this.isChangingPassword = true;
    this.authService.changeFirstTimePassword(
      this.changePasswordUserEmail,
      this.firstTimeCurrentPassword,
      this.firstTimeNewPassword
    ).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        if (res.success) {
          this.showChangePasswordModal = false;
          this.password = '';
          this.successMessage = 'Password updated successfully! Please sign in with your new password to access the system.';
        } else {
          this.changePasswordError = res.message || 'Failed to update password.';
        }
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        this.changePasswordError = err.error?.message || 'An error occurred while updating your password.';
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  openHelpModal() {
    this.showHelpModal = true;
  }

  closeHelpModal() {
    this.showHelpModal = false;
  }

  openResetPasswordModal() {
    this.showResetPasswordModal = true;
  }

  closeResetPasswordModal() {
    this.showResetPasswordModal = false;
    this.resetEmailAddress = '';
  }

  submitResetPassword() {
    alert(`A verification code has been dispatched to ${this.resetEmailAddress}`);
    this.closeResetPasswordModal();
  }

  createAccount() {
    alert('Account creation is managed by the system administrator. Please contact the IT support desk to request access credentials.');
  }

  viewUserGuide() {
    alert('User guide document download will begin shortly.');
  }
}
