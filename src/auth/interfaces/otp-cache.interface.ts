export interface OtpCacheData {
  otp: string;            // Hashed OTP
  userId: number;         // User ID
  email: string;          // User email
  phone?: string;         // User phone (optional)
  createdAt: number;      // Timestamp
  attempts: number;       // Failed verification attempts
  lastRequestAt: number;  // Last request timestamp (for rate limiting)
}