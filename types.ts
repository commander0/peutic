
export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  avatar?: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'PREMIUM' | 'BANNED';
  joinedAt: string;
}

export interface Companion {
  id: string;
  name: string;
  specialty: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  imageUrl: string;
  rating: number;
  bio: string;
  replicaId: string;
}

export interface Transaction {
  id: string;
  userId?: string; // Optional for global revenue tracking
  userName?: string;
  date: string;
  amount: number; // In Minutes
  cost?: number; // In Dollars
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED';
}

export interface GlobalSettings {
  pricePerMinute: number;
  maintenanceMode: boolean;
  allowSignups: boolean;
  siteName: string;
}
