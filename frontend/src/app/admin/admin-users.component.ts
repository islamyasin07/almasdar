import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdminApiService } from '../services/admin-api.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AdminUsersComponent implements OnInit {
  api = inject(AdminApiService);
  lang = inject(LanguageService);

  q = '';
  role: 'admin' | 'staff' | 'customer' | '' = '' as any;
  active: 'true' | 'false' | '' = '' as any;
  loading = signal(false);
  users = signal<any[]>([]);
  page = 1; limit = 20; total = 0; pages = 1;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.listUsers({ q: this.q || undefined, role: this.role || undefined, active: this.active || undefined, page: this.page, limit: this.limit })
      .subscribe({
        next: (res) => { 
          this.users.set(res.users || []); 
          this.total = res.total || 0; 
          this.pages = res.pages || Math.max(1, Math.ceil((this.total || 0) / (this.limit || 1)));
          this.loading.set(false); 
        },
        error: (err) => { 
          console.error('Error loading users:', err);
          this.users.set([]);
          this.loading.set(false); 
        }
      });
  }

  prevPage(): void {
    if (this.page > 1) { this.page--; this.load(); }
  }

  nextPage(): void {
    if (this.page < this.pages) { this.page++; this.load(); }
  }

  setRole(user: any, role: 'admin' | 'staff' | 'customer'): void {
    this.loading.set(true);
    this.api.updateUserRole(user._id, role).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error('Error updating role:', err);
        alert(this.lang.t('admin.errorUpdating'));
        this.loading.set(false);
      }
    });
  }

  onActiveChange(user: any, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setActive(user, target.checked);
  }

  setActive(user: any, isActive: boolean): void {
    this.loading.set(true);
    this.api.updateUserStatus(user._id, isActive).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error('Error updating status:', err);
        alert(this.lang.t('admin.errorUpdating'));
        this.loading.set(false);
      }
    });
  }

  deleteUser(user: any): void {
    const confirmMsg = `${this.lang.t('admin.confirmDelete')} ${user.email}?`;
    if (!confirm(confirmMsg)) return;
    
    this.loading.set(true);
    this.api.deleteUser(user._id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error('Error deleting user:', err);
        alert(this.lang.t('admin.errorDeleting'));
        this.loading.set(false);
      }
    });
  }
}
