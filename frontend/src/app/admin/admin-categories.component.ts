import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdminApiService } from '../services/admin-api.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(-20px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ])
  ]
})
export class AdminCategoriesComponent implements OnInit {
  api = inject(AdminApiService);
  lang = inject(LanguageService);
  
  q = '';
  loading = signal(false);
  categories = signal<any[]>([]);
  showModal = false;
  editing: any | null = null;
  form: any = { name: '', slug: '', description: '', sortOrder: 0, isActive: true };

  ngOnInit(): void { 
    this.load(); 
  }

  load(): void {
    this.loading.set(true);
    this.api.listCategories({ q: this.q || undefined }).subscribe({
      next: (res) => { 
        this.categories.set(res || []); 
        this.loading.set(false); 
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories.set([]);
        this.loading.set(false);
      }
    });
  }

  openModal(cat?: any): void {
    this.editing = cat || null;
    this.form = cat ? { ...cat } : { name: '', slug: '', description: '', sortOrder: 0, isActive: true };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editing = null;
    this.form = { name: '', slug: '', description: '', sortOrder: 0, isActive: true };
  }

  generateSlug(): void {
    if (!this.editing) {
      this.form.slug = this.form.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  }

  save(): void {
    if (!this.form.name || !this.form.slug) {
      alert(this.lang.t('admin.fillRequired'));
      return;
    }

    this.loading.set(true);
    const body = { ...this.form };
    const obs = this.editing 
      ? this.api.updateCategory(this.editing._id, body) 
      : this.api.createCategory(body);
    
    obs.subscribe({
      next: () => { 
        this.closeModal();
        this.load(); 
      },
      error: (err) => {
        console.error('Error saving category:', err);
        alert(this.lang.t('admin.errorSaving'));
        this.loading.set(false);
      }
    });
  }

  deleteCategory(cat: any): void {
    const confirmMsg = `${this.lang.t('admin.confirmDelete')} ${cat.name}?`;
    if (!confirm(confirmMsg)) return;
    
    this.loading.set(true);
    this.api.deleteCategory(cat._id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error('Error deleting category:', err);
        alert(this.lang.t('admin.errorDeleting'));
        this.loading.set(false);
      }
    });
  }
}
