import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AdminApiService } from '../services/admin-api.service';
import { LanguageService } from '../services/language.service';

interface Sale {
  _id: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    serialNumber: string;
    productName: string;
    price: number;
    quantity: number;
    isReturned: boolean;
    returnReason?: string;
  }>;
  payments: Array<{
    amount: number;
    date: string;
    method: string;
  }>;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid';
  notes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sales-history.component.html',
  styleUrl: './admin-sales-history.component.scss'
})
export class AdminSalesHistoryComponent implements OnInit {
  sales = signal<Sale[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  statusFilter = signal<'all' | 'pending' | 'partial' | 'paid'>('all');
  selectedSale = signal<Sale | null>(null);
  isAddingPayment = signal(false);
  paymentAmount = signal(0);
  paymentMethod = signal('cash');

  filteredSales = computed(() => {
    let filtered = this.sales();

    // Filter by status
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(sale => sale.status === this.statusFilter());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(sale =>
        sale.customer.name.toLowerCase().includes(query) ||
        sale.customer.phone.includes(query) ||
        sale.items.some(item => item.serialNumber.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  totalSales = computed(() => this.sales().reduce((sum, sale) => sum + sale.totalAmount, 0));
  totalPaid = computed(() => this.sales().reduce((sum, sale) => sum + sale.paidAmount, 0));
  totalRemaining = computed(() => this.sales().reduce((sum, sale) => sum + sale.remainingAmount, 0));

  constructor(
    private router: Router,
    private adminApi: AdminApiService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.loadSales();
  }

  async loadSales() {
    try {
      this.isLoading.set(true);
      console.log('Loading sales from API...');
      const response: any = await lastValueFrom(this.adminApi.getSales());
      console.log('Sales API response:', response);
      
      // Backend returns { sales: [], total, page, pages }
      if (response && Array.isArray(response.sales)) {
        console.log('Sales count:', response.sales.length);
        this.sales.set(response.sales);
      } else if (Array.isArray(response)) {
        // In case backend returns array directly
        console.log('Sales count (direct array):', response.length);
        this.sales.set(response);
      } else {
        console.warn('Unexpected response format:', response);
        this.sales.set([]);
      }
    } catch (error: any) {
      console.error('Failed to load sales:', error);
      console.error('Error status:', error?.status);
      console.error('Error message:', error?.message);
      
      let errorMessage = 'فشل تحميل المبيعات.';
      if (error?.status === 401 || error?.status === 403) {
        errorMessage = 'ليس لديك صلاحية للوصول. الرجاء تسجيل الدخول كـ Admin.';
      } else if (error?.status === 0) {
        errorMessage = 'فشل الاتصال بالخادم. تأكد من تشغيل Backend.';
      }
      
      alert(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusColor(status: string): string {
    const colors = {
      paid: 'success',
      partial: 'warning',
      pending: 'danger'
    };
    return colors[status as keyof typeof colors] || 'danger';
  }

  getStatusIcon(status: string): string {
    const icons = {
      paid: 'fa-check-circle',
      partial: 'fa-clock',
      pending: 'fa-exclamation-circle'
    };
    return icons[status as keyof typeof icons] || 'fa-exclamation-circle';
  }

  viewSaleDetails(sale: Sale) {
    this.selectedSale.set(sale);
  }

  closeSaleDetails() {
    this.selectedSale.set(null);
    this.isAddingPayment.set(false);
    this.paymentAmount.set(0);
    this.paymentMethod.set('cash');
  }

  startAddPayment() {
    const sale = this.selectedSale();
    if (sale) {
      this.paymentAmount.set(sale.remainingAmount);
      this.isAddingPayment.set(true);
    }
  }

  cancelAddPayment() {
    this.isAddingPayment.set(false);
    this.paymentAmount.set(0);
    this.paymentMethod.set('cash');
  }

  async addPayment() {
    const sale = this.selectedSale();
    if (!sale) return;

    try {
      const updatedSale = await lastValueFrom(this.adminApi.addPayment(sale._id, {
        amount: this.paymentAmount(),
        method: this.paymentMethod()
      }));

      // Update the sale in the list
      const index = this.sales().findIndex(s => s._id === sale._id);
      if (index !== -1) {
        const newSales = [...this.sales()];
        newSales[index] = updatedSale;
        this.sales.set(newSales);
      }

      this.selectedSale.set(updatedSale);
      this.isAddingPayment.set(false);
      this.paymentAmount.set(0);
      this.paymentMethod.set('cash');
    } catch (error) {
      console.error('Failed to add payment:', error);
      alert(this.lang.t('admin.paymentFailed'));
    }
  }

  async returnItem(saleId: string, itemSerialNumber: string) {
    const reason = prompt(this.lang.t('admin.returnReason'));
    if (!reason) return;

    try {
      const updatedSale = await lastValueFrom(this.adminApi.returnItem(saleId, itemSerialNumber, reason));

      // Update the sale in the list
      const index = this.sales().findIndex(s => s._id === saleId);
      if (index !== -1) {
        const newSales = [...this.sales()];
        newSales[index] = updatedSale;
        this.sales.set(newSales);
      }

      if (this.selectedSale()?._id === saleId) {
        this.selectedSale.set(updatedSale);
      }
    } catch (error) {
      console.error('Failed to return item:', error);
      alert(this.lang.t('admin.returnFailed'));
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.lang.currentLanguage() === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString(this.lang.currentLanguage() === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToNewSale() {
    this.router.navigate(['/admin/sales/new']);
  }

  async exportCustomerExcelBySale(sale: Sale) {
    try {
      const customerId = (sale as any)?.customer?._id || (sale as any)?.customerId || (typeof (sale as any)?.customer === 'string' ? (sale as any).customer : '');
      if (!customerId) {
        alert('Customer not found for export');
        return;
      }
      const blob = await lastValueFrom(this.adminApi.exportCustomerSalesExcel(customerId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (sale as any)?.customer?.name || 'customer';
      a.download = `${safeName.replace(/[^\w\- ]/g, '')}_sales.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert(this.lang.t('admin.error'));
    }
  }
}
