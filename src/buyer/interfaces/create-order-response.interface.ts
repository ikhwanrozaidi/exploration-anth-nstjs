export interface CreateOrderResponse {
  paymentId: string;
  paymentType: string;
  sellerId: number;
  buyerId: number;
  merchantId?: number;
  amount: number;
  isRequest: boolean;
  status: string;
  merchantOrderId?: string;
  isCompleted: boolean;
  paymentDetails: {
    productName: string;
    productDesc: string[];
    productCat: string;
    amount: number;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    refundable: boolean;
    deliveryStatus: string;
  };
  buyer: {
    id: number;
    email: string;
    username: string;
  };
  seller: {
    id: number;
    email: string;
    username: string;
  };
}