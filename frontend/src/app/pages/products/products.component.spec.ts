import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductsComponent } from './products.component';

describe('ProductsComponent (carousel basics)', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render hero carousel container', () => {
    const el = fixture.nativeElement.querySelector('.hero-carousel');
    expect(el).toBeTruthy();
  });

  it('should switch slides with next/previous', () => {
    const start = component.currentSlide;
    component.nextSlide();
    expect(component.currentSlide).toBe((start + 1) % component.featuredSlides.length);
    component.previousSlide();
    expect(component.currentSlide).toBe(start);
  });

  it('should go to a specific slide', () => {
    component.goToSlide(2);
    expect(component.currentSlide).toBe(2);
  });
});
