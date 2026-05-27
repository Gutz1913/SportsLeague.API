import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  MatCardModule, MatFormFieldModule, MatInputModule,
  MatButtonModule, MatIconModule, MatProgressSpinnerModule
} from './../../shared/material.imports';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>sports_soccer</mat-icon>
            Iniciar Sesión
          </mat-card-title>
          <mat-card-subtitle>Liga Deportiva</mat-card-subtitle>
        </mat-card-header>
 
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
              @if (loginForm.get('email')?.hasError('required') &&
                   loginForm.get('email')?.touched) {
                <mat-error>El email es requerido</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Email inválido</mat-error>
              }
            </mat-form-field>
 
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password"
                     [type]="hidePassword ? 'password' : 'text'">
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') &&
                   loginForm.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
            </mat-form-field>
 
            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn"
                    [disabled]="loginForm.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Iniciar Sesión
              }
            </button>
          </form>
        </mat-card-content>
 
        <mat-card-actions align="end">
          <a routerLink="/register">
            ¿No tienes cuenta? Regístrate
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: #f5f5f5;
    }
    .auth-card { width: 100%; max-width: 420px; padding: 24px; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    mat-card-header { justify-content: center; margin-bottom: 24px; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    mat-card-actions a { text-decoration: none; color: #1565C0; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
 
  hidePassword = true;
  loading = false;
 
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
 
  onSubmit(): void {
    if (this.loginForm.invalid) return;
 
    this.loading = true;
    this.authService.login(this.loginForm.getRawValue() as any).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.notification.success('Bienvenido!');
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

