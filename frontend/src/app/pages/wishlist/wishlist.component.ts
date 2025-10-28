import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  isLoading = true;
  products: Product[] = [];
  error = '';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    if (!this.auth.isAuthenticated) {
      this.isLoading = false;
      this.products = [];
      return;
    }
    this.api.getWishlist().subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load wishlist';
        this.isLoading = false;
      }
    });
  }

  remove(productId: string): void {
    if (!this.auth.isAuthenticated) return;
    this.api.removeFromWishlist(productId).subscribe({
      next: () => this.products = this.products.filter(p => p._id !== productId),
      error: () => {}
    });
  }

  addToCart(p: Product): void {
    if (p.status === 'out_of_stock' || p.stock <= 0) return;
    this.cart.addItem({
      product: p._id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || 'assets/images/placeholder.jpg',
      sku: p.sku,
      stock: p.stock
    }, 1);
    this.cart.open();
  }
}
