import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/product.model';
import { PLATFORM_ID } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  isLoading = true;

  categories = [
    {
      name: 'CCTV Systems',
      icon: 'fas fa-video',
      description: 'High-definition surveillance cameras',
      image: 'assets/images/cctv.jpg',
      link: '/products?category=cctv'
    },
    {
      name: 'Access Control',
      icon: 'fas fa-door-open',
      description: 'Biometric & card-based access systems',
      image: 'assets/images/access.jpg',
      link: '/products?category=access-control'
    },
    {
      name: 'Alarm Systems',
      icon: 'fas fa-bell',
      description: 'Intrusion detection & alert systems',
      image: 'assets/images/alarm.jpg',
      link: '/products?category=alarm'
    },
    {
      name: 'Smart Locks',
      icon: 'fas fa-lock',
      description: 'Intelligent locking solutions',
      image: 'assets/images/locks.jpg',
      link: '/products?category=smart-locks'
    }
  ];

  features = [
    {
      icon: 'fas fa-shield-check',
      titleKey: 'home.feature1Title',
      descKey: 'home.feature1Desc'
    },
    {
      icon: 'fas fa-headset',
      titleKey: 'home.feature2Title',
      descKey: 'home.feature2Desc'
    },
    {
      icon: 'fas fa-award',
      titleKey: 'home.feature3Title',
      descKey: 'home.feature3Desc'
    },
    {
      icon: 'fas fa-shipping-fast',
      titleKey: 'home.feature4Title',
      descKey: 'home.feature4Desc'
    }
  ];

  constructor(
    private apiService: ApiService, 
    @Inject(PLATFORM_ID) private platformId: Object,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    // Avoid SSR fetch errors when backend is not running
    if (isPlatformBrowser(this.platformId)) {
      this.loadFeaturedProducts();
    }
  }

  loadFeaturedProducts(): void {
    this.apiService.getProducts({ limit: 8, featured: true }).subscribe({
      next: (response) => {
        this.featuredProducts = response.products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.isLoading = false;
      }
    });
  }
}
