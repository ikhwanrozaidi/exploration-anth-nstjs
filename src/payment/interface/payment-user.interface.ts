export interface UserPaymentResponse {
  paymentId: string;
  paymentType: string;
  sellerId: number | null;
  buyerId: number;
  merchantId: number | null;
  amount: number;
  isRequest: boolean;
  status: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userRole: 'buyer' | 'seller' | 'merchant';
  paymentDetails?: any;
  seller?: any;
  buyer?: any;
  provider?: any;
}