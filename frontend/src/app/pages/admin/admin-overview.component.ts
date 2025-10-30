import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.scss']
})
export class AdminOverviewComponent implements OnInit {
  lang = inject(LanguageService);
  api = inject(AdminApiService);
  
  loading = signal(true);
  stats = signal({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Simulating API call - replace with real API
    setTimeout(() => {
      this.stats.set({
        totalUsers: 1250,
        totalProducts: 342,
        totalOrders: 1853,
        totalRevenue: 125890,
        pendingOrders: 23,
        lowStockProducts: 12
      });
      this.loading.set(false);
    }, 1000);
  }
}
