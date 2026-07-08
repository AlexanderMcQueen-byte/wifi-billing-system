const dotenv = require('dotenv');

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI || '',  // Must be set; no local fallback
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
    ,
    hotspotInterface: process.env.ROUTER_HOTSPOT_INTERFACE || ''
    ,
    commandLogFile: process.env.ROUTER_COMMAND_LOGFILE || ''
  }
  ,
  admin: {
    token: process.env.ROUTER_ADMIN_TOKEN || ''
  },
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    kvNamespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID || '',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || ''
  }
};

function assertConfig(pairs) {
  const missing = pairs.filter((pair) => !pair.value).map((pair) => pair.key);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

config.turnstile = {
  siteKey: process.env.TURNSTILE_SITE_KEY || '',
  secretKey: process.env.TURNSTILE_SECRET_KEY || ''
};

module.exports = {
  config,
  assertConfig
};
