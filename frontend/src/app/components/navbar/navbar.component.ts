import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isProfileDropdownOpen = false;
  cartItemCount = 0;
  wishlistCount = 0;
  searchQuery = '';

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    public cartService: CartService,
    public themeService: ThemeService,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.loadCartCount();
      this.loadWishlistCount();
    }

    // Also listen to local cart for instant UI updates (SSR-safe)
    this.cartService.items$.subscribe(items => {
      this.cartItemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    });
  }

  loadCartCount(): void {
    this.apiService.getCart().subscribe({
      next: (cart: Cart) => {
        this.cartItemCount = cart.items.reduce((sum: number, item) => sum + item.quantity, 0);
      },
      error: (err: unknown) => console.error('Failed to load cart', err)
    });
  }

  loadWishlistCount(): void {
    this.apiService.getWishlist().subscribe({
      next: (wishlist: { _id: string; products: Product[] }) => {
        this.wishlistCount = wishlist.products.length;
      },
      error: (err: unknown) => console.error('Failed to load wishlist', err)
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.relative');
    
    if (!clickedInside && this.isProfileDropdownOpen) {
      this.isProfileDropdownOpen = false;
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
      this.isMenuOpen = false;
    }
  }

  openCart(): void {
    this.cartService.open();
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
    this.closeProfileDropdown();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
  }

  get userInitials(): string {
    const user = this.authService.currentUserValue;
    if (user?.profile) {
      const firstName = user.profile.firstName || '';
      const lastName = user.profile.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  get userName(): string {
    const user = this.authService.currentUserValue;
    if (user?.profile) {
      return `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
    }
    return 'User';
  }
}
