const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, adminOnly } = require('../middleware/auth');

// GET all audit logs (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { action, entity, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (action) filter.action = new RegExp(action, 'i');
    if (entity) filter.entity = entity;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({ logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE old logs (admin)
router.delete('/clear', protect, adminOnly, async (req, res) => {
  try {
    const { before } = req.query; // ISO date string
    const filter = before ? { createdAt: { $lt: new Date(before) } } : {};
    const result = await AuditLog.deleteMany(filter);
    res.json({ message: `Deleted ${result.deletedCount} logs` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
