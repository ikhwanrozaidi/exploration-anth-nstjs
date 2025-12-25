export interface UserPaymentSummary {
  completeOrder: number;
  waitReceiveAmount: number;
  completeReceive: number;
  waitReleaseAmount: number;
  completeRelease: number;
  transactions: UserPaymentTransaction[];
}

export interface UserPaymentTransaction {
  paymentId: string;
  paymentType: string;
  sellerId: number | null;
  buyerId: number;
  merchantId: number | null;
  amount: number;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  userRole: 'buyer' | 'seller';
  paymentDetails: {
    productName: string;
    productDesc: string[];
    productCat: string;
    amount: number;
    refundable: boolean;
  };
  seller: {
    id: number;
    email: string;
  } | null;
  buyer: {
    id: number;
    email: string;
  };
}