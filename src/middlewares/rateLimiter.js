const CloudflareStore = require('../services/cloudflareStore');
const { config } = require('../config/config');

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX_REQUESTS = 2; // max STK requests per window

function now() {
  return Date.now();
}

function pruneOld(entries) {
  const cutoff = now() - WINDOW_SECONDS * 1000;
  return entries.filter((ts) => ts >= cutoff);
}

function buildStore() {
  const cloudflareCfg = config.cloudflare || {};
  const accountId = (cloudflareCfg.accountId || '').trim();
  const kvNamespaceId = (cloudflareCfg.kvNamespaceId || '').trim();
  const apiToken = (cloudflareCfg.apiToken || '').trim();

  if (!accountId || !kvNamespaceId || !apiToken || 
      accountId.startsWith('your_') || kvNamespaceId.startsWith('your_') || apiToken.startsWith('your_')) {
    throw new Error(
      'Cloudflare KV is required for rate limiting. ' +
      'Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID, and CLOUDFLARE_API_TOKEN in .env ' +
      '(do not use placeholder values starting with "your_")'
    );
  }
  try {
    return new CloudflareStore(cloudflareCfg);
  } catch (e) {
    throw new Error('Cloudflare KV store initialization failed: ' + (e.message || e));
  }
}

const store = buildStore();

async function recordAndCheck(key) {
  const existing = (await store.get(key)) || { timestamps: [] };
  existing.timestamps = pruneOld(existing.timestamps);
  existing.timestamps.push(now());
  await store.set(key, existing, WINDOW_SECONDS);
  return existing.timestamps.length <= MAX_REQUESTS;
}

async function rateLimiter(req, res, next) {
  try {
    const forwarded = (req.headers['x-forwarded-for'] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ip = forwarded.length ? forwarded[0] : req.ip || req.connection?.remoteAddress || 'unknown';
    const mac = (req.body && req.body.macAddress) || req.query.mac || req.headers['x-client-mac'] || '';

    const ipKey = `ip:${ip}`;
    const macKey = mac ? `mac:${String(mac).toLowerCase()}` : null;

    const ipAllowed = await recordAndCheck(ipKey);
    const macAllowed = macKey ? await recordAndCheck(macKey) : true;

    if (!ipAllowed || !macAllowed) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait 10 minutes before requesting another payment pin.' });
    }

    req.rateLimit = { ipKey, macKey };
    return next();
  } catch (err) {
    console.error('Rate limiter error:', err && err.message ? err.message : err);
    return next();
  }
}

module.exports = rateLimiter;
