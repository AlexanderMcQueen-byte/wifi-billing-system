const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { config } = require('./config/config');
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
