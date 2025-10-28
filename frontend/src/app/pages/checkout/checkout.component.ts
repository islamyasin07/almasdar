import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  step: 1 | 2 | 3 = 1;

  shipping = {
    fullName: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', zip: '', country: ''
  };

  payment = {
    method: 'card' as 'card' | 'cod',
    cardNumber: '', cardName: '', exp: '', cvc: ''
  };

  constructor(public cart: CartService) {}

  next(): void {
    if (this.step === 1) this.step = 2;
    else if (this.step === 2) this.step = 3;
  }

  back(): void { if (this.step > 1) this.step = (this.step - 1) as any; }

  placeOrder(): void {
    // Stub: integrate with backend later
    alert('Order placed (stub)!');
  }
}
