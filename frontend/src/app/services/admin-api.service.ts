import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUserListResponse {
  users: any[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Users
  listUsers(params?: { role?: string; active?: string; q?: string; page?: number; limit?: number; sort?: string }): Observable<AdminUserListResponse> {
    const httpParams = new HttpParams({ fromObject: (params as any) || {} });
    return this.http.get<AdminUserListResponse>(`${this.apiUrl}/admin/users`, { params: httpParams });
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${id}`);
  }

  updateUserRole(id: string, role: 'admin' | 'staff' | 'customer'): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${id}/role`, { role });
  }

  updateUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${id}/status`, { isActive });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${id}`);
  }

  // Categories
  listCategories(params?: { active?: string; q?: string }): Observable<any[]> {
    const httpParams = new HttpParams({ fromObject: (params as any) || {} });
    return this.http.get<any[]>(`${this.apiUrl}/categories`, { params: httpParams });
  }

  getCategory(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, body);
  }

  updateCategory(id: string, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, body);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // Banners
  listBanners(params?: { position?: string; active?: string }): Observable<any[]> {
    const httpParams = new HttpParams({ fromObject: (params as any) || {} });
    return this.http.get<any[]>(`${this.apiUrl}/banners/admin`, { params: httpParams });
  }

  listActiveBanners(position?: string): Observable<any[]> {
    const params = position ? new HttpParams().set('position', position) : undefined;
    return this.http.get<any[]>(`${this.apiUrl}/banners`, { params });
  }

  createBanner(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/banners`, body);
  }

  updateBanner(id: string, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/banners/${id}`, body);
  }

  deleteBanner(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/banners/${id}`);
  }

  // Sales
  createSale(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales`, body);
  }

  getSales(params?: any): Observable<any> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http.get<any>(`${this.apiUrl}/sales`, { params: httpParams });
  }

  getSale(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales/${id}`);
  }

  updateSale(id: string, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/sales/${id}`, body);
  }

  deleteSale(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sales/${id}`);
  }

  addPayment(saleId: string, payment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales/${saleId}/payment`, payment);
  }

  returnItem(saleId: string, itemSerialNumber: string, returnReason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales/return-item`, { saleId, itemSerialNumber, returnReason });
  }

  searchProductBySerial(serialNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales/search-product`, { params: { serialNumber } });
  }

  // Customers
  searchOrCreateCustomer(data: { name: string; phone?: string; email?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers/search-or-create`, data);
  }

  getCustomers(params?: any): Observable<any> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http.get<any>(`${this.apiUrl}/customers`, { params: httpParams });
  }

  getCustomer(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${id}`);
  }

  updateCustomer(id: string, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}`, body);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${id}`);
  }

  // Database Health & Statistics
  getDatabaseHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/database/health`);
  }

  getSalesStatistics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Observable<any> {
    return this.http.get(`${this.apiUrl}/database/sales-stats`, { params: { period } });
  }
}
