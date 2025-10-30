import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { LanguageService } from '../../services/language.service';

interface Review {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  reviews: Review[] = [];
  isLoading = true;
  
  // Image gallery
  selectedImage = '';
  
  // Product options
  quantity = 1;
  selectedTab = 'description'; // description, specifications, reviews
  
  // Review form
  showReviewForm = false;
  newReview = {
    rating: 5,
    comment: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cart: CartService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    
    // Mock product data - replace with API call
    setTimeout(() => {
      this.product = {
        _id: id,
        name: 'Professional 8MP 4K Ultra HD CCTV Camera System',
        description: 'Advanced 8-channel 4K security camera system with AI-powered motion detection, night vision up to 100ft, weatherproof design, and mobile app integration. Perfect for home and business security.',
        price: 1299.99,
        category: 'cctv',
        images: [
          'assets/images/products/cctv-1.jpg',
          'assets/images/products/cctv-2.jpg',
          'assets/images/products/cctv-3.jpg',
          'assets/images/products/cctv-4.jpg'
        ],
        specifications: {
          'Resolution': '8MP / 4K Ultra HD',
          'Channels': '8 Camera Channels',
          'Storage': '2TB HDD Included',
          'Night Vision': 'Up to 100ft',
          'Weatherproof': 'IP67 Rated',
          'Viewing Angle': '110° Wide Angle',
          'Power': 'PoE (Power over Ethernet)',
          'Warranty': '3 Years'
        },
        stock: 45,
        status: 'active',
        sku: 'CCTV-8MP-001',
        brand: 'SecurePro',
        warranty: '3 Years Manufacturer Warranty',
        features: [
          'AI-Powered Motion Detection',
          'Smart Night Vision Technology',
          'Mobile App & Cloud Storage',
          'Two-Way Audio Communication',
          'Weatherproof IP67 Design',
          'Easy DIY Installation',
          'Remote Viewing & Playback',
          'H.265+ Video Compression'
        ],
        technicalDetails: {
          'Video Output': 'HDMI, VGA',
          'Network': 'Ethernet, WiFi',
          'Operating Temperature': '-10°C to 55°C'
        },
        installationGuide: 'Complete installation guide included',
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.selectedImage = this.product.images[0];
      this.isLoading = false;
      
      // Load related products and reviews
      this.loadRelatedProducts();
      this.loadReviews();
    }, 500);
  }

  loadRelatedProducts(): void {
    // Mock related products - replace with API call
    // this.apiService.getProducts({ category: this.product?.category, limit: 4 })
  }

  loadReviews(): void {
    // Mock reviews - replace with API call
    this.reviews = [
      {
        _id: '1',
        user: { firstName: 'John', lastName: 'Smith' },
        rating: 5,
        comment: 'Excellent camera system! Very clear image quality even at night.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        user: { firstName: 'Sarah', lastName: 'Johnson' },
        rating: 4,
        comment: 'Great product, easy to install. The mobile app works perfectly.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  changeQuantity(amount: number): void {
    const newQuantity = this.quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (this.product?.stock || 0)) {
      this.quantity = newQuantity;
    }
  }

  addToCart(): void {
    if (this.product) {
      if (this.product.status === 'out_of_stock' || this.product.stock <= 0) return;
      this.cart.addItem({
        product: this.product._id,
        name: this.product.name,
        price: this.product.price,
        image: this.product.images?.[0] || 'assets/images/placeholder.jpg',
        sku: this.product.sku,
        stock: this.product.stock
      }, this.quantity);
      this.cart.open();
    }
  }

  addToWishlist(): void {
    if (this.product) {
      // Add to wishlist logic
      console.log('Adding to wishlist:', this.product._id);
      alert('Product added to wishlist!');
    }
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  submitReview(): void {
    if (this.newReview.comment.trim()) {
      // Submit review logic
      console.log('Submitting review:', this.newReview);
      alert('Review submitted successfully!');
      this.showReviewForm = false;
      this.newReview = { rating: 5, comment: '' };
    }
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.lang.isArabic() ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
