const express = require('express');
const Setting = require('../../models/Setting');
const { requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// GET /api/admin/settings
router.get('/', requireAdmin, async (req, res) => {
  try {
    const s = await Setting.findOne().lean().exec();
    res.json({ success: true, settings: s || {} });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/settings - replace or create singleton settings
router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    let s = await Setting.findOne().exec();
    if (!s) {
      s = new Setting(body);
    } else {
      Object.assign(s, body);
    }
    await s.save();
    res.json({ success: true, settings: s });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
