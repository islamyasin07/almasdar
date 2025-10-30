import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-banners.component.html',
  styleUrls: ['./admin-banners.component.scss']
})
export class AdminBannersComponent implements OnInit {
  private api = inject(AdminApiService);
  position = '';
  active = '';
  loading = signal(false);
  banners = signal<any[]>([]);
  editing: any | null = null;
  form: any = { title: '', imageUrl: '', linkUrl: '', position: 'homepage', sortOrder: 0, isActive: true };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.listBanners({ position: this.position || undefined, active: this.active || undefined }).subscribe({
      next: (res) => { this.banners.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  edit(b?: any): void {
    this.editing = b || null;
    this.form = b ? { ...b } : { title: '', imageUrl: '', linkUrl: '', position: 'homepage', sortOrder: 0, isActive: true };
  }

  save(): void {
    const body = { ...this.form };
    const obs = this.editing ? this.api.updateBanner(this.editing._id, body) : this.api.createBanner(body);
    obs.subscribe(() => { this.editing = null; this.form = { title: '', imageUrl: '', linkUrl: '', position: 'homepage', sortOrder: 0, isActive: true }; this.load(); });
  }

  remove(b: any): void {
    if (!confirm('Delete this banner?')) return;
    this.api.deleteBanner(b._id).subscribe(() => this.load());
  }
}
