import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Address } from '../../models/user.model';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-addresses.component.html',
  styleUrls: ['./account-addresses.component.scss']
})
export class AccountAddressesComponent implements OnInit {
  addresses: Address[] = [];
  addressForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  showForm = false;
  editingAddressId: string | null = null;
  message = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public lang: LanguageService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  initForm(): void {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      street: ['', [Validators.required]],
      apartment: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      isDefault: [false]
    });
  }

  loadAddresses(): void {
    this.isLoading = true;
    this.apiService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.error = 'Failed to load addresses';
        this.isLoading = false;
      }
    });
  }

  showAddForm(): void {
    this.resetForm();
    this.editingAddressId = null;
    this.showForm = true;
  }

  editAddress(address: Address): void {
    this.editingAddressId = address._id || null;
    this.addressForm.patchValue(address);
    this.showForm = true;
  }

  cancelForm(): void {
    this.resetForm();
    this.showForm = false;
    this.editingAddressId = null;
  }

  resetForm(): void {
    this.addressForm.reset({
      fullName: '',
      phone: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
    this.message = '';
    this.error = '';
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      return;
    }

    this.isSaving = true;
    this.message = '';
    this.error = '';

    const addressData = this.addressForm.value;

    if (this.editingAddressId) {
      // Update existing address
      this.apiService.updateAddress(this.editingAddressId, addressData).subscribe({
        next: () => {
          this.message = 'Address updated successfully!';
          this.isSaving = false;
          this.loadAddresses();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error updating address:', error);
          this.error = error.error?.message || 'Failed to update address';
          this.isSaving = false;
        }
      });
    } else {
      // Add new address
      this.apiService.addAddress(addressData).subscribe({
        next: () => {
          this.message = 'Address added successfully!';
          this.isSaving = false;
          this.loadAddresses();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error adding address:', error);
          this.error = error.error?.message || 'Failed to add address';
          this.isSaving = false;
        }
      });
    }
  }

  deleteAddress(addressId: string): void {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    this.apiService.deleteAddress(addressId).subscribe({
      next: () => {
        this.message = 'Address deleted successfully!';
        this.loadAddresses();
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting address:', error);
        this.error = error.error?.message || 'Failed to delete address';
      }
    });
  }

  setDefaultAddress(addressId: string): void {
    const addressData = { isDefault: true };
    this.apiService.updateAddress(addressId, addressData).subscribe({
      next: () => {
        this.message = 'Default address updated!';
        this.loadAddresses();
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error setting default address:', error);
        this.error = error.error?.message || 'Failed to set default address';
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

  isFieldInvalid(field: string): boolean {
    const control = this.addressForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.addressForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return this.lang.t('common.required');
    }
    return '';
  }
}
