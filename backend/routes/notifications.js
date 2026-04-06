const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET student's notifications (non-expired only)
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      recipient: req.user._id,
      expiresAt: { $gte: now },
    })
      .populate({ path: 'drive', populate: { path: 'job', populate: 'company' } })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mark as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
