export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  specifications: Record<string, string>;
  stock: number;
  status: ProductStatus;
  sku: string;
  brand?: string;
  warranty?: string;
  features: string[];
  technicalDetails?: Record<string, string>;
  installationGuide?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductFilters {
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}
