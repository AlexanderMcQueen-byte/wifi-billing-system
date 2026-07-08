const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { config } = require('./config/config');

// Verify all required cloud services are configured before starting
if (!config.mongoUri || config.mongoUri.startsWith('mongodb://127.0.0.1')) {
  throw new Error('MONGO_URI environment variable is required (use MongoDB Atlas or similar cloud service). No localhost fallback allowed.');
}
const cfAcct = (config.cloudflare.accountId || '').trim();
const cfKv = (config.cloudflare.kvNamespaceId || '').trim();
const cfToken = (config.cloudflare.apiToken || '').trim();
if (!cfAcct || !cfKv || !cfToken || cfAcct.startsWith('your_') || cfKv.startsWith('your_') || cfToken.startsWith('your_')) {
  throw new Error(
    'Cloudflare KV environment variables are required and must not be placeholders: ' +
    'CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID, CLOUDFLARE_API_TOKEN'
  );
}

const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/admin/authRoutes');
const settingsRoutes = require('./routes/admin/settingsRoutes');
const packageRoutes = require('./routes/admin/packageRoutes');
const routerConfigRoutes = require('./routes/admin/routerConfigRoutes');
const { startCleanupScheduler } = require('./services/routerCleanup');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
// Capture raw body for endpoints that require payload signature verification (webhooks)
app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
      // store raw body for callback signature verification
      if (req && req.headers && String(req.originalUrl || '').startsWith('/api/callback')) {
        req.rawBody = buf.toString('utf8');
      }
    }
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wi-Fi billing API is running'
  });
});

// Public endpoint to expose the Turnstile site key to clients (site key is safe to expose)
app.get('/api/turnstile/sitekey', (req, res) => {
  try {
    const siteKey = (config.turnstile && config.turnstile.siteKey) || '';
    return res.status(200).json({ success: true, siteKey });
  } catch (err) {
    return res.status(500).json({ success: false, siteKey: '' });
  }
});

app.use('/api', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/packages', packageRoutes);
app.use('/api/admin/routers', routerConfigRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

async function startServer() {
  try {
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000
    });

    console.log('Connected to MongoDB');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      // Start optional cleanup scheduler
      try {
        startCleanupScheduler();
      } catch (e) {
        console.warn('Could not start cleanup scheduler:', e.message || e);
      }
    });
  } catch (error) {
    console.error('Startup error (could not connect to MongoDB):', error.message);
    console.error('Database connection is required. Exiting.');
    process.exit(1);
  }
}

startServer();
