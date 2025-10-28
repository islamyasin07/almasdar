import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private router: Router) {}

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
}
