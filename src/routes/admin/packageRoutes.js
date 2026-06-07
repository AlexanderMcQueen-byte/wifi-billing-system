const express = require('express');
const Setting = require('../../models/Setting');
const { requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// GET packages
router.get('/', requireAdmin, async (req, res) => {
  try {
    const s = await Setting.findOne().lean().exec();
    res.json({ success: true, packages: (s && s.packages) || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create package
router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body.key || !body.name || !body.amount || !body.duration) return res.status(400).json({ error: 'missing fields' });
    let s = await Setting.findOne().exec();
    if (!s) s = new Setting();
    s.packages = s.packages || [];
    s.packages.push(body);
    await s.save();
    res.json({ success: true, package: body });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update package by key
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const key = req.params.key;
    const s = await Setting.findOne().exec();
    if (!s) return res.status(404).json({ error: 'settings not found' });
    const idx = (s.packages || []).findIndex((p) => p.key === key);
    if (idx === -1) return res.status(404).json({ error: 'package not found' });
    s.packages[idx] = Object.assign(s.packages[idx], req.body);
    await s.save();
    res.json({ success: true, package: s.packages[idx] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE package
router.delete('/:key', requireAdmin, async (req, res) => {
  try {
    const key = req.params.key;
    const s = await Setting.findOne().exec();
    if (!s) return res.status(404).json({ error: 'settings not found' });
    s.packages = (s.packages || []).filter((p) => p.key !== key);
    await s.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
