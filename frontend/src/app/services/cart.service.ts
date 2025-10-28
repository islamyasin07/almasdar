import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart.model';

interface StoredCartItem {
  product: string; // productId
  name: string;
  price: number;
  image?: string;
  sku?: string;
  stock?: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'cart';
  private isBrowser: boolean;

  private itemsSubject = new BehaviorSubject<StoredCartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  private openSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.openSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredCartItem[];
          this.itemsSubject.next(parsed);
        } catch {}
      }
    }
  }

  open(): void { this.openSubject.next(true); }
  close(): void { this.openSubject.next(false); }
  toggle(): void { this.openSubject.next(!this.openSubject.value); }

  get items(): StoredCartItem[] { return this.itemsSubject.value; }

  get itemCount(): number { return this.items.reduce((s,i)=>s+i.quantity,0); }
  get subtotal(): number { return this.items.reduce((s,i)=>s+i.price*i.quantity,0); }
  get total(): number { return this.subtotal; } // taxes/shipping later

  addItem(item: Omit<StoredCartItem,'quantity'>, quantity = 1): void {
    const items = [...this.items];
    const idx = items.findIndex(x => x.product === item.product);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: Math.min((items[idx].quantity + quantity), (item.stock ?? Infinity)) };
    } else {
      items.push({ ...item, quantity: Math.min(quantity, item.stock ?? quantity) });
    }
    this.update(items);
  }

  setQuantity(productId: string, quantity: number): void {
    const items = this.items.map(i => i.product === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock ?? quantity)) } : i);
    this.update(items);
  }

  removeItem(productId: string): void {
    this.update(this.items.filter(i => i.product !== productId));
  }

  clear(): void { this.update([]); }

  private update(items: StoredCartItem[]): void {
    this.itemsSubject.next(items);
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    }
  }
}
