import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
 
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NotificationService);
 
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }
 
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }
 
    notification.error('No tienes permisos para acceder a esta sección.');
    router.navigate(['/']);
    return false;
  };
};
