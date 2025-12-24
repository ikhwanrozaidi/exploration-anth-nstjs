import { registerAs } from '@nestjs/config';

export default registerAs('spaces', () => ({
  endpoint: process.env.SPACES_ENDPOINT,
  region: process.env.SPACES_REGION,
  bucket: process.env.SPACES_BUCKET,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
  cdnEndpoint: process.env.SPACES_CDN_ENDPOINT,
}));