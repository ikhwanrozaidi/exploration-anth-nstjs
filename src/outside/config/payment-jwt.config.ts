import { registerAs } from '@nestjs/config';

export default registerAs('paymentJwt', () => {
  return {
    secret: process.env.PAYMENT_JWT_SECRET || 'your-super-secret-payment-key-change-in-production',
    expiresIn: '10m', // 10 minutes
    issuer: process.env.JWT_TOKEN_ISSUER || 'gatepay.dev',
    audience: process.env.JWT_TOKEN_AUDIENCE || 'payment.gatepay.dev',
  };
});