import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProductsComponent } from './pages/products/products.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminOverviewComponent } from './pages/admin/admin-overview.component';
import { roleGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';
import { AccountLayoutComponent } from './pages/account/account-layout.component';
import { AccountDashboardComponent } from './pages/account/account-dashboard.component';
import { AccountOrdersComponent } from './pages/account/account-orders.component';
import { AccountProfileComponent } from './pages/account/account-profile.component';
import { AccountAddressesComponent } from './pages/account/account-addresses.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'checkout', component: CheckoutComponent },
  {
    path: 'account',
    component: AccountLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: AccountDashboardComponent },
      { path: 'orders', component: AccountOrdersComponent },
      { path: 'profile', component: AccountProfileComponent },
      { path: 'addresses', component: AccountAddressesComponent },
    ]
  },
  { path: 'dashboard', redirectTo: 'account', pathMatch: 'full' },
  { path: 'orders', redirectTo: 'account/orders', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'account/profile', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'staff'] },
    children: [
      { path: '', component: AdminOverviewComponent },
      // other child routes (products, orders, users, etc.) to be added next
    ]
  },
  { path: '**', redirectTo: '' }
];
