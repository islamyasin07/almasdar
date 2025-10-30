import { TestBed } from '@angular/core/testing';
import { LanguageService, Language } from './language.service';
import { PLATFORM_ID } from '@angular/core';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(LanguageService);
  });

  it('should default to Arabic (ar)', () => {
  expect(service.currentLanguage()).toBe('ar');
    expect(service.isRTL()).toBeTrue();
  });

  it('should toggle language between ar and en', () => {
    const first = service.currentLanguage();
    service.toggleLanguage();
    const second = service.currentLanguage();
    expect(second).not.toBe(first);
    service.toggleLanguage();
    expect(service.currentLanguage()).toBe(first);
  });

  it('should set language explicitly', () => {
    service.setLanguage('en');
  expect(service.currentLanguage()).toBe('en');
    expect(service.isRTL()).toBeFalse();
    service.setLanguage('ar');
    expect(service.isRTL()).toBeTrue();
  });

  it('should translate known keys and fallback to key if missing', () => {
    service.setLanguage('en');
    expect(service.t('nav.products')).toBe('Products');
    expect(service.t('home.shopNow')).toBe('Shop Now');
    // missing key should return the key itself
    expect(service.t('does.not.exist')).toBe('does.not.exist');
  });
});
