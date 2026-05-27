import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, Validators, AbstractControl
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  MatCardModule, MatFormFieldModule, MatInputModule,
  MatButtonModule, MatIconModule, MatProgressSpinnerModule
} from './../../shared/material.imports';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
 
@Component({
  selector: 'app-register',
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
            <mat-icon>person_add</mat-icon> Registro
          </mat-card-title>
        </mat-card-header>
 
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="firstName">
                @if (f['firstName']?.hasError('required') && f['firstName']?.touched) {
                  <mat-error>Requerido</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="lastName">
                @if (f['lastName']?.hasError('required') && f['lastName']?.touched) {
                  <mat-error>Requerido</mat-error>
                }
              </mat-form-field>
            </div>
 
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
              @if (f['email']?.hasError('required') && f['email']?.touched) {
                <mat-error>El email es requerido</mat-error>
              }
              @if (f['email']?.hasError('email')) {
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
              @if (f['password']?.hasError('required') && f['password']?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
              @if (f['password']?.hasError('minlength')) {
                <mat-error>Mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>
 
            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn"
                    [disabled]="registerForm.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Registrarse
              }
            </button>
          </form>
        </mat-card-content>
 
        <mat-card-actions align="end">
          <a routerLink="/login">¿Ya tienes cuenta? Inicia sesión</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: #f5f5f5;
    }
    .auth-card { width: 100%; max-width: 480px; padding: 24px; }
    .full-width { width: 100%; }
    .name-row { display: flex; gap: 16px; }
    .name-row mat-form-field { flex: 1; }
    .submit-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    mat-card-header { justify-content: center; margin-bottom: 24px; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    mat-card-actions a { text-decoration: none; color: #1565C0; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
 
  hidePassword = true;
  loading = false;
 
  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
 
  get f() { return this.registerForm.controls; }
 
  onSubmit(): void {
    if (this.registerForm.invalid) return;
 
    this.loading = true;
    this.authService.register(this.registerForm.getRawValue() as any).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.notification.success('Registro exitoso. Inicia sesión.');
          this.router.navigate(['/login']);
        }
      },
      error: () => { this.loading = false; }
    });
  }
}

