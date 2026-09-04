import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../models/case.model';

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    const payload = {
      email: (email || '').trim().toLowerCase(),
      password
    };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, payload).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  changeFirstTimePassword(email: string, currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    const payload = {
      email: (email || '').trim().toLowerCase(),
      currentPassword,
      newPassword
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/change-first-time-password`, payload).pipe(
      tap(() => {
        this.logout();
      })
    );
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('auth_token', authResult.token);
    localStorage.setItem('user_role', authResult.role);
    localStorage.setItem('user_name', authResult.name);
    localStorage.setItem('user_email', authResult.email);
    if (authResult.mustChangePassword) {
      localStorage.setItem('must_change_password', 'true');
    } else {
      localStorage.removeItem('must_change_password');
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('must_change_password');
  }

  public isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  public getRole(): string | null {
    return localStorage.getItem('user_role');
  }

  public getUserName(): string | null {
    return localStorage.getItem('user_name');
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public mustChangePassword(): boolean {
    return localStorage.getItem('must_change_password') === 'true';
  }
}
