export interface CartItem {
  product: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  sku: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}
