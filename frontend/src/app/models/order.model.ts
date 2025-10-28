import { Address } from './user.model';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  name: string;
  sku: string;
}

export interface Order {
  _id: string;
  customer: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
  notes?: string;
  couponCode?: string;
}

export interface OrderListResponse {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
