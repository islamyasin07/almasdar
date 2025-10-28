import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);

  // Add access token to request
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (token expired)
      if (error.status === 401 && authService.isAuthenticated) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          // Try to refresh the token
          return apiService.refreshToken(refreshToken).pipe(
            switchMap((response) => {
              // Update the access token
              authService.updateAccessToken(response.accessToken);
              
              // Retry the original request with new token
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`
                }
              });
              return next(clonedRequest);
            }),
            catchError((refreshError) => {
              // Refresh failed, logout user
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token, logout
          authService.logout();
        }
      }
      
      return throwError(() => error);
    })
  );
};
