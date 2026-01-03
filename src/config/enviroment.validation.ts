import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  PROFILE_API_KEY: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.number().required(),
  PAYMENT_JWT_SECRET: Joi.string().required(),
  SPACES_ENDPOINT: Joi.string().required(),
  SPACES_REGION: Joi.string().required(),
  SPACES_BUCKET: Joi.string().required(),
  SPACES_KEY: Joi.string().required(),
  SPACES_SECRET: Joi.string().required(),
  SPACES_CDN_ENDPOINT: Joi.string().required(),
  P2P_PROVIDER_ID: Joi.string().uuid().required(),
  P2P_PERCENTAGE_FEES: Joi.number().min(0).max(1).default(0.02),
});
