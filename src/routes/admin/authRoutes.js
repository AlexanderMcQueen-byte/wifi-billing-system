const express = require('express');
const jwt = require('jsonwebtoken');
const AdminUser = require('../../models/AdminUser');

const router = express.Router();

// POST /api/admin/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const existing = await AdminUser.findOne({ email }).exec();
    if (existing) return res.status(409).json({ error: 'user exists' });
    const user = await AdminUser.createWithPassword(email, password, name);
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '12h' });
    res.json({ success: true, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await AdminUser.findOne({ email }).exec();
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '12h' });
    res.json({ success: true, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
