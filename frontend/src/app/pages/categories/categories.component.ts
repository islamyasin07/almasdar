import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  icon: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  isLoading = false;

  categories: Category[] = [
    {
      id: '1',
      name: 'CCTV Systems',
      slug: 'cctv',
      description: 'Professional surveillance cameras, DVRs, NVRs, and complete monitoring solutions',
      image: 'assets/images/categories/cctv.jpg',
      productCount: 156,
      icon: 'fa-video'
    },
    {
      id: '2',
      name: 'Access Control',
      slug: 'access-control',
      description: 'Biometric systems, card readers, electronic locks, and access management solutions',
      image: 'assets/images/categories/access-control.jpg',
      productCount: 89,
      icon: 'fa-door-open'
    },
    {
      id: '3',
      name: 'Alarm Systems',
      slug: 'alarm',
      description: 'Intrusion detection, fire alarms, panic buttons, and emergency notification systems',
      image: 'assets/images/categories/alarm.jpg',
      productCount: 124,
      icon: 'fa-bell'
    },
    {
      id: '4',
      name: 'Smart Locks',
      slug: 'smart-locks',
      description: 'Keyless entry, smart deadbolts, digital locks, and mobile-controlled security',
      image: 'assets/images/categories/smart-locks.jpg',
      productCount: 67,
      icon: 'fa-lock'
    },
    {
      id: '5',
      name: 'Intercom Systems',
      slug: 'intercoms',
      description: 'Video intercoms, audio communication, gate entry systems, and visitor management',
      image: 'assets/images/categories/intercom.jpg',
      productCount: 78,
      icon: 'fa-intercom'
    },
    {
      id: '6',
      name: 'Sensors & Detectors',
      slug: 'sensors',
      description: 'Motion sensors, smoke detectors, glass break sensors, and environmental monitoring',
      image: 'assets/images/categories/sensors.jpg',
      productCount: 143,
      icon: 'fa-sensor'
    },
    {
      id: '7',
      name: 'Network Equipment',
      slug: 'network',
      description: 'PoE switches, network cables, routers, and connectivity solutions for security systems',
      image: 'assets/images/categories/network.jpg',
      productCount: 92,
      icon: 'fa-network-wired'
    },
    {
      id: '8',
      name: 'Power Supplies',
      slug: 'power',
      description: 'UPS systems, backup batteries, power adapters, and surge protection devices',
      image: 'assets/images/categories/power.jpg',
      productCount: 54,
      icon: 'fa-plug'
    }
  ];

  constructor(
    private router: Router,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    // In real app, load categories from API
    // this.loadCategories();
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/products'], {
      queryParams: { category: category.slug }
    });
  }

  getTotalProducts(): number {
    return this.categories.reduce((sum, cat) => sum + cat.productCount, 0);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    // Prevent infinite error loops
    (img as any).onerror = null;
    // Mark as placeholder for CSS targeting
    img.setAttribute('data-placeholder', 'true');
    // Neutral gray SVG placeholder without any red tint
    const svg = `<?xml version='1.0' encoding='UTF-8'?>
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='#111827'/>
            <stop offset='100%' stop-color='#1f2937'/>
          </linearGradient>
        </defs>
        <rect width='1200' height='800' fill='url(#g)'/>
        <g opacity='0.15'>
          <circle cx='200' cy='150' r='120' fill='#9ca3af'/>
          <circle cx='1000' cy='650' r='160' fill='#6b7280'/>
        </g>
        <g fill='#9ca3af' opacity='0.5'>
          <rect x='520' y='310' width='160' height='120' rx='12'/>
          <circle cx='600' cy='350' r='12'/>
        </g>
      </svg>`;
    const encoded = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    img.src = encoded;
  }
}
