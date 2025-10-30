import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductFilters } from '../../models/product.model';
import { PLATFORM_ID } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  limit = 12;

  // Filters
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  sortBy = 'createdAt';
  minPrice = 0;
  maxPrice = 10000;
  
  // Filter UI
  showFilters = false;
  priceRange = [0, 10000];

  // Carousel
  currentSlide = 0;
  carouselInterval: any;
  featuredSlides = [
    {
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200',
      title: 'Advanced CCTV Systems',
      titleAr: 'أنظمة كاميرات المراقبة المتطورة',
      description: 'State-of-the-art surveillance solutions for complete security',
      descriptionAr: 'حلول مراقبة متطورة لأمن شامل',
      category: 'cctv'
    },
    {
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200',
      title: 'Smart Access Control',
      titleAr: 'التحكم الذكي بالدخول',
      description: 'Cutting-edge access management for modern facilities',
      descriptionAr: 'إدارة وصول حديثة للمرافق العصرية',
      category: 'access-control'
    },
    {
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200',
      title: 'Intelligent Alarm Systems',
      titleAr: 'أنظمة إنذار ذكية',
      description: 'Next-generation protection with instant alerts',
      descriptionAr: 'حماية الجيل القادم مع تنبيهات فورية',
      category: 'alarm'
    }
  ];

  categories = [
    { value: '', label: 'All Categories' },
    { value: 'cctv', label: 'CCTV Systems' },
    { value: 'access-control', label: 'Access Control' },
    { value: 'alarm', label: 'Alarm Systems' },
    { value: 'smart-locks', label: 'Smart Locks' },
    { value: 'intercoms', label: 'Intercom Systems' },
    { value: 'sensors', label: 'Sensors & Detectors' }
  ];

  sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: '-createdAt', label: 'Oldest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' }
  ];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cart: CartService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    // Get query params (fetch only in browser to avoid SSR fetch errors)
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.selectedCategory = params['category'] || '';
      this.currentPage = +params['page'] || 1;
      this.sortBy = params['sort'] || 'createdAt';
      if (isPlatformBrowser(this.platformId)) {
        console.log('Loading products from browser...');
        this.loadProducts();
        this.startCarousel();
      } else {
        console.log('SSR detected, skipping product load');
        this.isLoading = false;
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    const filters: ProductFilters = {
      page: this.currentPage,
      limit: this.limit,
      sort: this.sortBy
    };

    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.selectedCategory) filters.category = this.selectedCategory;
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.minPrice > 0) filters.minPrice = this.minPrice;
    if (this.maxPrice < 10000) filters.maxPrice = this.maxPrice;

    console.log('Fetching products with filters:', filters);

    this.apiService.getProducts(filters).subscribe({
      next: (response) => {
        console.log('Products received:', response);
        this.products = response.products;
        this.totalPages = response.pages;
        this.totalProducts = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onPriceRangeChange(): void {
    this.minPrice = this.priceRange[0];
    this.maxPrice = this.priceRange[1];
    this.currentPage = 1;
    this.updateQueryParams();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.sortBy = 'createdAt';
    this.minPrice = 0;
    this.maxPrice = 10000;
    this.priceRange = [0, 10000];
    this.currentPage = 1;
    this.updateQueryParams();
  }

  // Carousel methods
  startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.featuredSlides.length;
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0 
      ? this.featuredSlides.length - 1 
      : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.stopCarousel();
    this.startCarousel();
  }

  navigateToCategory(category: string): void {
    this.selectedCategory = category;
    this.updateQueryParams();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updateQueryParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateQueryParams(): void {
    const queryParams: any = {
      page: this.currentPage > 1 ? this.currentPage : null,
      search: this.searchQuery || null,
      category: this.selectedCategory || null,
      sort: this.sortBy !== 'createdAt' ? this.sortBy : null
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  addToCart(product: Product): void {
    // Guard out-of-stock
    if (product.status === 'out_of_stock' || product.stock <= 0) {
      return;
    }
    this.cart.addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || 'assets/images/placeholder.jpg',
      sku: product.sku,
      stock: product.stock
    }, 1);
    this.cart.open();
  }
}
