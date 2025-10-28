import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthTokens } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Load user from localStorage on init (only in browser)
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  get isStaff(): boolean {
    return this.currentUserValue?.role === 'staff' || this.isAdmin;
  }

  setAuthData(user: User, tokens: AuthTokens): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    this.currentUserSubject.next(user);
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem('accessToken') : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refreshToken') : null;
  }

  updateAccessToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', token);
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
