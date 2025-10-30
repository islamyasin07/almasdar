import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Prevent authenticated users from visiting guest-only pages like /login and /register
export const guestGuard: CanActivateFn = (_route, _state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    // If user is already logged in, send them to a sensible default
    const redirectTo = auth.isStaff ? '/admin' : '/';
    return router.createUrlTree([redirectTo]);
  }

  return true;
};
