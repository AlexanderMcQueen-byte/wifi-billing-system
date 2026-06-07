const dotenv = require('dotenv');

dotenv.config({ path: process.env.PORTAL_ENV_FILE || '.env' });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wifi_billing',
  mpesa: {
    environment: process.env.DARAJA_ENV || 'sandbox',
    consumerKey: process.env.DARAJA_CONSUMER_KEY || '',
    consumerSecret: process.env.DARAJA_CONSUMER_SECRET || '',
    passKey: process.env.DARAJA_PASSKEY || '',
    shortCode: process.env.DARAJA_SHORTCODE || '',
    callbackUrl: process.env.DARAJA_CALLBACK_URL || '',
    callbackSecret: process.env.DARAJA_CALLBACK_SECRET || '',
    baseUrl:
      (process.env.DARAJA_ENV || 'sandbox') === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke'
  },
  router: {
    host: process.env.ROUTER_HOST || '',
    port: Number(process.env.ROUTER_PORT || 8728),
    user: process.env.ROUTER_USER || '',
    password: process.env.ROUTER_PASSWORD || '',
    secure: String(process.env.ROUTER_SECURE || 'false').toLowerCase() === 'true'
  }
};

function assertConfig(pairs) {
  const missing = pairs.filter((pair) => !pair.value).map((pair) => pair.key);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

module.exports = { config, assertConfig };
