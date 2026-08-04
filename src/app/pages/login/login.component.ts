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

  // Modals Visibility Controls
  showHelpModal = false;
  showResetPasswordModal = false;

  // Form binds
  resetEmailAddress = '';

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/dashboard']);
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
