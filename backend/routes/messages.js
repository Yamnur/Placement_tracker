const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

// ── Student: send a message ──────────────────────────────────────────────────
router.post('/', protect, studentOnly, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const msg = await Message.create({
      student: req.user._id,
      sender: req.user._id,
      senderRole: 'student',
      text: text.trim(),
      isReadByAdmin: false,
      isReadByStudent: true,
    });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Student: get own conversation ────────────────────────────────────────────
router.get('/my', protect, studentOnly, async (req, res) => {
  try {
    const messages = await Message.find({ student: req.user._id })
      .sort({ createdAt: 1 });

    // Mark admin replies as read by student
    await Message.updateMany(
      { student: req.user._id, senderRole: 'admin', isReadByStudent: false },
      { isReadByStudent: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Student: get unread count (admin replies not yet seen) ───────────────────
router.get('/my/unread', protect, studentOnly, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      student: req.user._id,
      senderRole: 'admin',
      isReadByStudent: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: get all students who have sent messages ───────────────────────────
router.get('/conversations', protect, adminOnly, async (req, res) => {
  try {
    // Get distinct student IDs that have messages
    const studentIds = await Message.distinct('student');

    const students = await User.find({ _id: { $in: studentIds } })
      .select('name email branch rollNumber');

    // For each student get last message + unread count
    const conversations = await Promise.all(
      students.map(async (s) => {
        const lastMsg = await Message.findOne({ student: s._id })
          .sort({ createdAt: -1 });
        const unread = await Message.countDocuments({
          student: s._id,
          senderRole: 'student',
          isReadByAdmin: false,
        });
        return { student: s, lastMessage: lastMsg, unreadCount: unread };
      })
    );

    // Sort by latest message
    conversations.sort((a, b) =>
      new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
    );

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: get conversation with a specific student ──────────────────────────
router.get('/conversation/:studentId', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find({ student: req.params.studentId })
      .sort({ createdAt: 1 });

    // Mark student messages as read by admin
    await Message.updateMany(
      { student: req.params.studentId, senderRole: 'student', isReadByAdmin: false },
      { isReadByAdmin: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: reply to a student ─────────────────────────────────────────────────
router.post('/reply/:studentId', protect, adminOnly, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Reply cannot be empty' });

    const student = await User.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const msg = await Message.create({
      student: req.params.studentId,
      sender: req.user._id,
      senderRole: 'admin',
      text: text.trim(),
      isReadByAdmin: true,
      isReadByStudent: false,
    });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: total unread count across all students ────────────────────────────
router.get('/unread-count', protect, adminOnly, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      senderRole: 'student',
      isReadByAdmin: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
