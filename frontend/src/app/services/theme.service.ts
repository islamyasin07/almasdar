import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  // Signal for reactive theme state
  theme = signal<Theme>('light');
  
  constructor() {
    // Only run in browser
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      
      // Effect to update DOM when theme changes
      effect(() => {
        const currentTheme = this.theme();
        this.applyTheme(currentTheme);
      });
    }
  }
  
  private initializeTheme(): void {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      this.theme.set(savedTheme);
    } else {
      // Default to light (professional dark blue) - user can toggle to deeper dark
      this.theme.set('light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.theme.set(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  private applyTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      const html = document.documentElement;
      
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      
      localStorage.setItem('theme', theme);
    }
  }
  
  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }
  
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
  
  isDark(): boolean {
    return this.theme() === 'dark';
  }
}
