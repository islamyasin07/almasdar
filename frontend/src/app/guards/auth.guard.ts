import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR/prerender allow navigation
  if (!isPlatformBrowser(platformId)) return true;

  if (auth.isAuthenticated) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
