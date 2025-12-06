export interface UserPaymentResponse {
  paymentId: string;
  paymentType: string;
  receiverId: string | null;
  senderId: string;
  merchantId: number | null;
  amount: number;
  isRequest: boolean;
  status: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userRole: 'sender' | 'receiver' | 'merchant';
  paymentDetails?: any;
  receiver?: any;
  sender?: any;
  provider?: any;
}