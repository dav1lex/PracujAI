// Credit System Types for Pracuj.pl Scraper Web Portal

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  total_consumed: number;
  is_early_adopter: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'consumption' | 'grant';
  amount: number;
  description?: string;
  stripe_payment_intent_id?: string;
  desktop_session_id?: string;
  created_at: string;
}

export interface DesktopSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  last_activity: string;
  is_active: boolean;
  user_agent?: string;
  created_at: string;
}

export interface AppDownload {
  id: string;
  user_id: string;
  version: string;
  download_url: string;
  file_size?: number;
  download_completed: boolean;
  ip_address?: string;
  user_agent?: string;
  downloaded_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  stripe_price_id: string;
  popular: boolean;
  description: string;
}

export interface UserCreditSummary {
  user_id: string;
  balance: number;
  total_purchased: number;
  total_consumed: number;
  is_early_adopter: boolean;
  credits_created_at: string;
  credits_updated_at: string;
  recent_transactions_count: number;
  last_transaction_date: string;
}

// API Response Types
export interface CreditBalanceResponse {
  balance: number;
  total_purchased: number;
  total_consumed: number;
  is_early_adopter: boolean;
  low_credit_warning: boolean;
}

export interface CreditTransactionResponse {
  transactions: CreditTransaction[];
  total_count: number;
  page: number;
  per_page: number;
}

export interface CreditConsumptionRequest {
  amount: number;
  description: string;
  desktop_session_id?: string;
}

export interface CreditPurchaseRequest {
  package_id: string;
  stripe_payment_intent_id: string;
}

// Desktop App Authentication Types
export interface DesktopAuthRequest {
  user_agent?: string;
  app_version?: string;
}

export interface DesktopAuthResponse {
  session_token: string;
  expires_at: string;
  user_id: string;
}

export interface TokenValidationRequest {
  session_token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  user_id?: string;
  expires_at?: string;
  remaining_credits?: number;
}

// Download Types
export interface AppVersionInfo {
  version: string;
  download_url: string;
  file_size: number;
  release_notes: string;
  minimum_system_requirements: string;
}

export interface DownloadRequest {
  version?: string;
  user_agent?: string;
}

// Error Types
export interface CreditSystemError {
  code: string;
  message: string;
  details?: any;
}

// Constants for credit packages
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'package_100',
    name: '100 dopasowań',
    credits: 100,
    price: 29.99,
    stripe_price_id: 'price_1RufBhKuwoRu2dXwila6C0rw', // 100 credits package
    popular: false,
    description: 'Idealny na początek - 100 dopasowań ofert pracy'
  },
  {
    id: 'package_200',
    name: '200 dopasowań',
    credits: 200,
    price: 49.99,
    stripe_price_id: 'price_1RufCKuwoRu2dXwNvQx8Yz3P', // 200 credits package
    popular: true,
    description: 'Najpopularniejszy - 200 dopasowań z 20% oszczędnością'
  },
  {
    id: 'package_500',
    name: '500 dopasowań',
    credits: 500,
    price: 99.99,
    stripe_price_id: 'price_1RufCpKuwoRu2dXwMkL7Hx9Q', // 500 credits package
    popular: false,
    description: 'Najlepsza wartość - 500 dopasowań z 33% oszczędnością'
  }
];

// Credit system constants
export const CREDIT_CONSTANTS = {
  FREE_CREDITS_AMOUNT: 100,
  EARLY_ADOPTER_LIMIT: 10,
  LOW_CREDIT_THRESHOLD: 10,
  SESSION_DURATION_HOURS: 24,
  MAX_SESSIONS_PER_USER: 5
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  PURCHASE: 'purchase' as const,
  CONSUMPTION: 'consumption' as const,
  GRANT: 'grant' as const
};

// Error codes
export const CREDIT_ERROR_CODES = {
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  INVALID_SESSION: 'INVALID_SESSION',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_PACKAGE: 'INVALID_PACKAGE',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED'
} as const;