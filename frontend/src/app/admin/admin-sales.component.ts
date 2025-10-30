import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdminApiService } from '../services/admin-api.service';
import { LanguageService } from '../services/language.service';

interface SaleItem {
  serialNumber: string;
  productName: string;
  quantity: number;
  price: number;
  images?: string[];
  productId?: string;
}

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sales.component.html',
  styleUrls: ['./admin-sales.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class AdminSalesComponent implements OnInit {
  api = inject(AdminApiService);
  lang = inject(LanguageService);
  router = inject(Router);

  // State
  loading = signal(false);
  showNewSaleForm = false;

  // Customer
  customerSearchQuery = '';
  selectedCustomer: any = null;
  customerSuggestions: any[] = [];

  // Items
  items: SaleItem[] = [];
  currentItem: Partial<SaleItem> = {
    serialNumber: '',
    productName: '',
    quantity: 1,
    price: 0
  };
  searchingProduct = false;

  // Payments
  payments: any[] = [];
  currentPayment = {
    amount: 0,
    method: 'cash',
    notes: ''
  };

  // Sale metadata
  saleDate = new Date().toISOString().slice(0, 16);
  notes = '';

  ngOnInit() {
    // Can load sales history here if needed
  }

  // Customer search
  searchCustomer() {
    if (!this.customerSearchQuery.trim()) return;

    this.api.getCustomers({ q: this.customerSearchQuery }).subscribe({
      next: (res: any) => {
        this.customerSuggestions = res.customers || [];
      },
      error: (err) => console.error('Error searching customers:', err)
    });
  }

  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    this.customerSuggestions = [];
    this.customerSearchQuery = customer.name;
  }

  createNewCustomer() {
    if (!this.customerSearchQuery.trim()) return;

    this.loading.set(true);
    this.api.searchOrCreateCustomer({ name: this.customerSearchQuery }).subscribe({
      next: (customer) => {
        this.selectedCustomer = customer;
        this.customerSuggestions = [];
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error creating customer:', err);
        this.loading.set(false);
      }
    });
  }

  // Product search by serial
  searchProductBySerial() {
    if (!this.currentItem.serialNumber?.trim()) return;

    this.searchingProduct = true;
    this.api.searchProductBySerial(this.currentItem.serialNumber).subscribe({
      next: (res: any) => {
        this.searchingProduct = false;
        if (res.found && res.product) {
          this.currentItem.productName = res.product.name;
          this.currentItem.price = res.product.price;
          this.currentItem.productId = res.product._id;
        }
      },
      error: (err) => {
        console.error('Error searching product:', err);
        this.searchingProduct = false;
      }
    });
  }

  addItem() {
    if (!this.currentItem.serialNumber || !this.currentItem.productName || !this.currentItem.price) {
      alert(this.lang.t('admin.fillRequired'));
      return;
    }

    this.items.push({
      serialNumber: this.currentItem.serialNumber,
      productName: this.currentItem.productName,
      quantity: this.currentItem.quantity || 1,
      price: this.currentItem.price,
      productId: this.currentItem.productId
    });

    // Reset form
    this.currentItem = {
      serialNumber: '',
      productName: '',
      quantity: 1,
      price: 0
    };
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  addPayment() {
    if (!this.currentPayment.amount || this.currentPayment.amount <= 0) {
      alert(this.lang.t('admin.fillRequired'));
      return;
    }

    this.payments.push({
      amount: this.currentPayment.amount,
      date: new Date(),
      method: this.currentPayment.method,
      notes: this.currentPayment.notes
    });

    // Reset payment form
    this.currentPayment = {
      amount: 0,
      method: 'cash',
      notes: ''
    };
  }

  removePayment(index: number) {
    this.payments.splice(index, 1);
  }

  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get paidAmount(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  get remainingAmount(): number {
    return this.totalAmount - this.paidAmount;
  }

  saveSale() {
    if (!this.selectedCustomer) {
      alert(this.lang.t('admin.selectCustomer'));
      return;
    }

    if (this.items.length === 0) {
      alert(this.lang.t('admin.addItem'));
      return;
    }

    this.loading.set(true);

    const saleData = {
      customerId: this.selectedCustomer._id,
      customerName: this.selectedCustomer.name,
      items: this.items,
      totalAmount: this.totalAmount,
      payments: this.payments,
      notes: this.notes,
      saleDate: new Date(this.saleDate)
    };

    this.api.createSale(saleData).subscribe({
      next: () => {
        alert(this.lang.t('admin.saleCreated'));
        this.resetForm();
        this.showNewSaleForm = false;
        this.loading.set(false);
        // Navigate to sales history
        this.router.navigate(['/admin/sales']);
      },
      error: (err) => {
        console.error('Error creating sale:', err);
        alert(this.lang.t('admin.errorSaving'));
        this.loading.set(false);
      }
    });
  }

  resetForm() {
    this.selectedCustomer = null;
    this.customerSearchQuery = '';
    this.items = [];
    this.payments = [];
    this.notes = '';
    this.currentItem = { serialNumber: '', productName: '', quantity: 1, price: 0 };
    this.currentPayment = { amount: 0, method: 'cash', notes: '' };
  }

  openNewSaleForm() {
    this.showNewSaleForm = true;
    this.resetForm();
  }

  closeNewSaleForm() {
    this.showNewSaleForm = false;
  }
}
