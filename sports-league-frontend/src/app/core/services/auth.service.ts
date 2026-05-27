import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../models/api-response.model';
import {
  LoginRequest, RegisterRequest, AuthResponse
} from '../models/auth.model';
 
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notification = inject(NotificationService);
 
  // Estado reactivo con Signals
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userEmailSignal = signal<string | null>(localStorage.getItem('user_email'));
  private userRolesSignal = signal<string[]>(
    JSON.parse(localStorage.getItem('user_roles') || '[]'));
 
  // Signals públicos de solo lectura
  token = this.tokenSignal.asReadonly();
  userEmail = this.userEmailSignal.asReadonly();
  userRoles = this.userRolesSignal.asReadonly();
 
  // Computed signals
  isAuthenticated = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => this.userRolesSignal().includes('Admin'));
  isReferee = computed(() => this.userRolesSignal().includes('Referee'));
  userName = computed(() => this.userEmailSignal()?.split('@')[0] ?? '');
 
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<ApiResponse<AuthResponse>>(
      'Auth/login', credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storeAuth(response.data);
        }
      })
    );
  }
 
  register(data: RegisterRequest): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>('Auth/register', data);
  }
 
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_roles');
    this.tokenSignal.set(null);
    this.userEmailSignal.set(null);
    this.userRolesSignal.set([]);
    this.router.navigate(['/login']);
    this.notification.info('Sesión cerrada');
  }
 
  hasRole(role: string): boolean {
    return this.userRolesSignal().includes(role);
  }
 
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.userRolesSignal().includes(role));
  }
 
  private storeAuth(auth: AuthResponse): void {
    localStorage.setItem('auth_token', auth.token);
    localStorage.setItem('user_email', auth.email);
    localStorage.setItem('user_roles', JSON.stringify(auth.roles));
    this.tokenSignal.set(auth.token);
    this.userEmailSignal.set(auth.email);
    this.userRolesSignal.set(auth.roles);
  }
 
  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
