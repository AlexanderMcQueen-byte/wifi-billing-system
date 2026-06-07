const express = require('express');
const RouterCommandLog = require('../models/RouterCommandLog');
const { config } = require('../config/config');

const router = express.Router();

// simple auth: require x-admin-token header if token configured
router.use((req, res, next) => {
  if (config.admin && config.admin.token) {
    const provided = req.headers['x-admin-token'] || '';
    if (!provided || provided !== config.admin.token) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  next();
});

// GET /api/admin/router-commands?limit=50
router.get('/router-commands', async (req, res) => {
  try {
    const limit = Math.min(1000, Number(req.query.limit || 50));
    const logs = await RouterCommandLog.find().sort({ createdAt: -1 }).limit(limit).lean().exec();
    res.json({ success: true, count: logs.length, logs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
