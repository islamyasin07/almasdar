import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-orders.component.html',
  styleUrls: ['./account-orders.component.scss']
})
export class AccountOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = true;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalOrders = 0;
  totalPages = 1;
  
  // Filters
  statusFilter: string = 'all';
  dateFilter: string = 'all'; // all, last30days, last90days, thisYear
  searchQuery: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    this.apiService.getOrders(params).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.totalOrders = response.total;
        this.totalPages = response.pages;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Date filter
    if (this.dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (this.dateFilter) {
          case 'last30days':
            return (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          case 'last90days':
            return (now.getTime() - orderDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
          case 'thisYear':
            return orderDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order.trackingNumber?.toLowerCase().includes(query)
      );
    }

    this.filteredOrders = filtered;
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onDateFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}

