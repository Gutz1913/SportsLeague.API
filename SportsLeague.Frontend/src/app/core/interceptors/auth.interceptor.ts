import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);
 
  // Agregar token si existe
  const token = authService.token();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
 
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        notification.error('Sesión expirada. Inicia sesión nuevamente.');
      } else if (error.status === 403) {
        notification.error('No tienes permisos para esta acción.');
      } else if (error.status === 409) {
        const message = error.error?.message || error.error?.errors?.[0]
          || 'Error de validación';
        notification.error(message);
      } else if (error.status === 404) {
        const message = error.error?.message || 'Recurso no encontrado';
        notification.error(message);
      } else if (error.status === 0) {
        notification.error('No se pudo conectar con el servidor.');
      } else {
        notification.error('Ocurrió un error inesperado.');
      }
      return throwError(() => error);
    })
  );
};
