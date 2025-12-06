// src/outside/config/berrypay.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('berrypay', () => {
  return {
    apiUrl: process.env.BERRYPAY_API_URL || 'https://secure.berrypay.dev/api/v3/fpx/payment',
    publicKey: process.env.BERRYPAY_PUBLIC_KEY,
    secretKey: process.env.BERRYPAY_SECRET_KEY,
    apiKey: process.env.BERRYPAY_API_KEY,
  };
});