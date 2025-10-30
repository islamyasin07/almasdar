import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CategoriesComponent } from './categories.component';

describe('CategoriesComponent (UI basics)', () => {
  let fixture: ComponentFixture<CategoriesComponent>;
  let component: CategoriesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render categories grid with cards', () => {
    const grid = fixture.nativeElement.querySelector('.categories-grid');
    expect(grid).toBeTruthy();
    const cards = grid.querySelectorAll('.category-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should show product-count badge without hover', () => {
    const badge = fixture.nativeElement.querySelector('.product-count-badge');
    expect(badge).toBeTruthy();
    // Badge should be visible (opacity 1 by default via CSS). We check computed style presence.
    const opacity = getComputedStyle(badge).opacity;
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
  });

  it('should set neutral placeholder on broken image and mark data-placeholder', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.category-image img');
    // Force broken src
    img.src = 'assets/images/does-not-exist.jpg';
    const errorEvent = new Event('error');
    img.dispatchEvent(errorEvent);
    fixture.detectChanges();
    expect(img.getAttribute('data-placeholder')).toBe('true');
    expect(img.src.startsWith('data:image/svg+xml')).toBeTrue();
  });
});
