// Consolidated application enums

/**
 * Payment status enumeration
 */
export enum PaymentStatus {
  FAIL = 'fail',
  SUCCESS = 'success',
  PENDING = 'pending',
  REPORT = 'report',
  REFUND = 'refund',
  CANCELLED = 'cancelled',
  NEWER = 'newer',
}

export enum PaymentOrderStatus {
  FAIL = 'fail',
  SUCCESS = 'success',
  PENDING = 'pending',
  REPORT = 'report',
  REFUND = 'refund',
  CANCELLED = 'cancelled',
  NEWER = 'newer',
}

/**
 * Payment type enumeration
 */
export enum PaymentType {
  GATEWAY = 'gateway',
  P2P = 'p2p',
}

/**
 * User status enumeration
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * User role enumeration
 */
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  STAFF = 'staff',
  USER = 'user',
}

/**
 * API key status enumeration
 */
export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REVOKED = 'revoked',
}

/**
 * Merchant audit status enumeration
 */
export enum MerchantAuditStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

/**
 * Merchant status enumeration
 */
export enum MerchantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * Payment provider status enumeration
 */
export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

/**
 * Audit log redirect status enumeration
 */
export enum RedirectStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
}

/**
 * Payment session status enumeration
 */
export enum PaymentSessionStatus {
  INITIATE = 'initiate',
  INVALID = 'invalid',
  PENDING = 'pending',
  EXPIRED = 'expired',
  SUCCESS = 'success',
  PASSED = 'passed',
  UNPASSED = 'unpassed',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

/**
 * Auth type enumeration
 */
export enum AuthType {
  SuperAdmin,
  Admin,
  Staff,
  User,
  None,
} 

/**
 * TierType enumeration
 */
export enum TierType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  DIAMOND = 'diamond',
}

/**
 * Wallet direction enumeration
 */
export enum WalletDirection {
  IN = 'in',
  OUT = 'out',
}

/**
 * Wallet source enumeration
 */
export enum WalletSource {
  TOPUP = 'topup',
  ORDER = 'order',
  RECEIVE = 'receive',
  SEND = 'send',
}