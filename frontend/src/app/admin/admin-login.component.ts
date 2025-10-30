import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, public lang: LanguageService, private http: HttpClient) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async login() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    try {
      const res: any = await this.http.post('/api/admin/login', this.form.value).toPromise();
      localStorage.setItem('adminToken', res.token);
      // TODO: Navigate to dashboard
    } catch (err: any) {
      this.error = err?.error?.error || this.lang.t('common.error');
    } finally {
      this.loading = false;
    }
  }
}
