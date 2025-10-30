import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  constructor(public langService: LanguageService) {}
  
  socialLinks = [
    { icon: 'fab fa-facebook', url: '#', label: 'Facebook' },
    { icon: 'fab fa-twitter', url: '#', label: 'Twitter' },
    { icon: 'fab fa-instagram', url: '#', label: 'Instagram' },
    { icon: 'fab fa-linkedin', url: '#', label: 'LinkedIn' }
  ];

  footerLinks = {
    company: [
      { labelKey: 'footer.aboutUs', route: '/about' },
      { labelKey: 'footer.careers', route: '/careers' },
      { labelKey: 'footer.blog', route: '/blog' },
      { labelKey: 'footer.pressKit', route: '/press' }
    ],
    support: [
      { labelKey: 'footer.helpCenter', route: '/help' },
      { labelKey: 'footer.contactUs', route: '/contact' },
      { labelKey: 'footer.faq', route: '/faq' },
      { labelKey: 'footer.shipping', route: '/shipping' },
      { labelKey: 'footer.returns', route: '/returns' }
    ],
    legal: [
      { labelKey: 'footer.privacyPolicy', route: '/privacy' },
      { labelKey: 'footer.termsOfService', route: '/terms' },
      { labelKey: 'footer.cookiePolicy', route: '/cookies' }
    ]
  };
}
