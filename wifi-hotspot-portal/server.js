const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { config } = require('./config/config');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));

// capture raw body for webhook verification
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    if (req && req.path && req.path.startsWith('/api/callback')) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Wi-Fi billing API is running' });
});

app.use('/api', paymentRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
    });
  } catch (error) {
    console.error('Startup error (could not connect to MongoDB):', error.message);
    process.exit(1);
  }
}

startServer();
// Entrypoint shim for the wifi-hotspot-portal structure.
// This file simply loads the main server from the primary project.
try {
  require('../src/server');
} catch (err) {
  // Provide a helpful error for someone trying to run this standalone copy
  console.error('Failed to start server from wifi-hotspot-portal/server.js:', err.message);
  process.exit(1);
}
