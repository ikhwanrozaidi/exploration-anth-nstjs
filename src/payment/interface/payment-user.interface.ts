export interface UserPaymentResponse {
  paymentId: string;
  paymentType: string;
  sellerId: string | null;
  buyerId: string;
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