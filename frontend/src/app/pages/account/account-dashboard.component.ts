import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss']
})
export class AccountDashboardComponent implements OnInit {
  user: any = null;
  stats = {
    totalOrders: 0,
    pendingOrders: 0,
    wishlistItems: 0,
    addresses: 0
  };
  recentOrders: any[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.user = this.authService.currentUserValue;

    // Load profile
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
      },
      error: (error) => console.error('Error loading profile:', error)
    });

    // Load orders
    this.apiService.getOrders({ page: 1, limit: 5 }).subscribe({
      next: (response) => {
        this.recentOrders = response.orders;
        this.stats.totalOrders = response.total;
        this.stats.pendingOrders = response.orders.filter((o: any) => 
          o.status === 'pending' || o.status === 'confirmed'
        ).length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });

    // Load wishlist
    this.apiService.getWishlist().subscribe({
      next: (wishlist) => {
        this.stats.wishlistItems = wishlist.products?.length || 0;
      },
      error: (error) => console.error('Error loading wishlist:', error)
    });

    // Load addresses
    this.apiService.getAddresses().subscribe({
      next: (addresses) => {
        this.stats.addresses = addresses.length;
      },
      error: (error) => console.error('Error loading addresses:', error)
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      shipped: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }
}
