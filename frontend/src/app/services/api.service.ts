import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { Product, ProductListResponse, ProductFilters } from '../models/product.model';
import { Cart, AddToCartRequest } from '../models/cart.model';
import { Order, CreateOrderRequest, OrderListResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== AUTH ====================
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data);
  }

  refreshToken(refreshToken: string): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, { refreshToken });
  }

  // ==================== PRODUCTS ====================
  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof ProductFilters];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<ProductListResponse>(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, data);
  }

  updateProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/products/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/products/meta/categories`);
  }

  // ==================== CART ====================
  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/cart`);
  }

  addToCart(data: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/cart`, data);
  }

  updateCartItem(productId: string, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/cart/${productId}`, { quantity });
  }

  removeFromCart(productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/cart/${productId}`);
  }

  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/cart`);
  }

  // ==================== ORDERS ====================
  createOrder(data: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, data);
  }

  getOrders(params?: any): Observable<OrderListResponse> {
    return this.http.get<OrderListResponse>(`${this.apiUrl}/orders`, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${id}/cancel`, {});
  }

  // ==================== WISHLIST ====================
  getWishlist(): Observable<{ _id: string; products: Product[] }> {
    return this.http.get<any>(`${this.apiUrl}/wishlist`);
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist`, { productId });
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${productId}`);
  }

  // ==================== REVIEWS ====================
  getProductReviews(productId: string, params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/product/${productId}`, { params });
  }

  createReview(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, data);
  }

  // ==================== USER ====================
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/profile`, data);
  }

  getAddresses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/addresses`);
  }

  addAddress(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/addresses`, data);
  }

  updateAddress(addressId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/addresses/${addressId}`, data);
  }

  deleteAddress(addressId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/addresses/${addressId}`);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, data);
  }
}
