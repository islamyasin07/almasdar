import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data?.['roles'] as string[] | undefined;

  // If no roles specified, allow access
  if (!roles || roles.length === 0) {
    return true;
  }

  const user = auth.currentUserValue;
  if (user && roles.includes(user.role)) {
    return true;
  }

  // Not authorized, redirect to login
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
