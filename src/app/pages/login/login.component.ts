import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    // For demo purposes, we accept any username/password combination
    // and redirect to dashboard
    this.router.navigate(['/dashboard']);
  }

  forgotPassword() {
    alert('Please contact the IT Helpdesk at univen.ac.za to reset your legal-case-system credentials.');
  }
}
