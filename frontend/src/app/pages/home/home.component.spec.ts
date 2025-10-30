import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent (floating elements)', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('should render hero section and floating elements', () => {
    const hero = fixture.nativeElement.querySelector('.hero-section');
    expect(hero).toBeTruthy();
    const butterflies = fixture.nativeElement.querySelectorAll('.floating-butterfly');
    const texts = fixture.nativeElement.querySelectorAll('.floating-text');
    expect(butterflies.length).toBeGreaterThanOrEqual(2);
    expect(texts.length).toBeGreaterThanOrEqual(2);
  });
});
