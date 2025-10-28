import { Component, computed, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CurrencyPipe],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent {
  constructor(public cart: CartService) {}

  trackById = (_: number, item: any) => item.product;

  increase(productId: string) {
    const item = this.cart.items.find(i => i.product === productId);
    if (!item) return;
    this.cart.setQuantity(productId, (item.quantity + 1));
  }
  decrease(productId: string) {
    const item = this.cart.items.find(i => i.product === productId);
    if (!item) return;
    this.cart.setQuantity(productId, Math.max(1, item.quantity - 1));
  }
}
