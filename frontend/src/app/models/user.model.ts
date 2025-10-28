export type UserRole = 'admin' | 'customer' | 'staff';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  addresses?: Address[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  avatar?: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    company?: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
