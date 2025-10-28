import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    { icon: 'fab fa-facebook', url: '#', label: 'Facebook' },
    { icon: 'fab fa-twitter', url: '#', label: 'Twitter' },
    { icon: 'fab fa-instagram', url: '#', label: 'Instagram' },
    { icon: 'fab fa-linkedin', url: '#', label: 'LinkedIn' }
  ];

  footerLinks = {
    company: [
      { label: 'About Us', route: '/about' },
      { label: 'Contact', route: '/contact' },
      { label: 'Careers', route: '/careers' },
      { label: 'Blog', route: '/blog' }
    ],
    support: [
      { label: 'Help Center', route: '/help' },
      { label: 'Installation Guide', route: '/installation' },
      { label: 'Shipping Info', route: '/shipping' },
      { label: 'Returns', route: '/returns' }
    ],
    legal: [
      { label: 'Privacy Policy', route: '/privacy' },
      { label: 'Terms of Service', route: '/terms' },
      { label: 'Cookie Policy', route: '/cookies' },
      { label: 'GDPR', route: '/gdpr' }
    ]
  };
}
