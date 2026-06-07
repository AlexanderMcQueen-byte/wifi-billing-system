const express = require('express');
const RouterConfig = require('../../models/RouterConfig');
const { requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// GET /api/admin/routers
router.get('/', requireAdmin, async (req, res) => {
  try {
    const list = await RouterConfig.find().lean().exec();
    res.json({ success: true, routers: list });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create router config
router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.host || !body.user || !body.password) return res.status(400).json({ error: 'missing fields' });
    const created = await RouterConfig.create(body);
    res.json({ success: true, router: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await RouterConfig.findByIdAndUpdate(id, req.body, { new: true }).exec();
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json({ success: true, router: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await RouterConfig.findByIdAndDelete(req.params.id).exec();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
