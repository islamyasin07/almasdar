import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isLoading = true;
  isSavingProfile = false;
  isSavingPassword = false;
  profileMessage = '';
  passwordMessage = '';
  profileError = '';
  passwordError = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    public lang: LanguageService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  loadProfile(): void {
    this.isLoading = true;
    this.apiService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          email: user.email,
          phone: user.profile.phone || '',
          company: user.profile.company || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.profileError = 'Failed to load profile data';
        this.isLoading = false;
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isSavingProfile = true;
    this.profileMessage = '';
    this.profileError = '';

    const profileData = this.profileForm.value;

    this.apiService.updateProfile(profileData).subscribe({
      next: (response) => {
        // Update auth service with new user data
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          currentUser.profile = {
            ...currentUser.profile,
            ...profileData
          };
          currentUser.email = profileData.email;
          
          const tokens = {
            accessToken: localStorage.getItem('accessToken') || '',
            refreshToken: localStorage.getItem('refreshToken') || ''
          };
          
          this.authService.setAuthData(currentUser, tokens);
        }

        this.profileMessage = 'Profile updated successfully!';
        this.isSavingProfile = false;

        // Clear message after 3 seconds
        setTimeout(() => {
          this.profileMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.profileError = error.error?.message || 'Failed to update profile';
        this.isSavingProfile = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isSavingPassword = true;
    this.passwordMessage = '';
    this.passwordError = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.apiService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        this.passwordMessage = 'Password changed successfully!';
        this.isSavingPassword = false;
        this.passwordForm.reset();

        // Clear message after 3 seconds
        setTimeout(() => {
          this.passwordMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.passwordError = error.error?.message || 'Failed to change password';
        this.isSavingPassword = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.errors) {
      if (control.errors['required']) return this.lang.t('common.required');
      if (control.errors['email']) return this.lang.t('accountProfile.invalidEmail');
      if (control.errors['minlength']) return `${this.lang.t('accountProfile.minLength')} ${control.errors['minlength'].requiredLength}`;
      if (control.errors['passwordMismatch']) return this.lang.t('accountProfile.passwordsMismatch');
    }
    return '';
  }
}
