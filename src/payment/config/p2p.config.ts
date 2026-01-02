import { registerAs } from '@nestjs/config';

export default registerAs('p2p', () => ({
  providerId: process.env.P2P_PROVIDER_ID,
  percentageFees: parseFloat(process.env.P2P_PERCENTAGE_FEES) || 0.02,
}));