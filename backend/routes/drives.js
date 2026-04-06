const express = require('express');
const router = express.Router();
const Drive = require('../models/Drive');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// GET all drives
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const drives = await Drive.find()
      .populate({ path: 'job', populate: { path: 'company' } })
      .sort({ driveDate: 1 });
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET active drives for students (not expired)
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const drives = await Drive.find({ deadline: { $gte: now }, status: { $ne: 'cancelled' } })
      .populate({ path: 'job', populate: { path: 'company' } })
      .sort({ deadline: 1 });
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single drive
router.get('/:id', protect, async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate({ path: 'job', populate: { path: 'company' } });
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json(drive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create drive
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const drive = await Drive.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(drive);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST send notification to eligible students
router.post('/:id/notify', protect, adminOnly, async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate({ path: 'job', populate: 'company' });

    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    const job = drive.job;

    // Eligibility check: CGPA >= minCGPA AND branch in eligibleBranches
    const eligibleStudents = await User.find({
      role: 'student',
      cgpa: { $gte: job.minCGPA },
      branch: { $in: job.eligibleBranches },
      isProfileComplete: true,
    });

    if (eligibleStudents.length === 0)
      return res.status(200).json({ message: 'No eligible students found', count: 0 });

    // Create notifications
    const notifications = eligibleStudents.map((student) => ({
      drive: drive._id,
      recipient: student._id,
      title: `${job.company.name} – ${job.role} Drive Open!`,
      message: `Apply before ${new Date(drive.deadline).toLocaleDateString()}. Role: ${job.role} | ${job.salary} ${job.salaryUnit}`,
      expiresAt: drive.deadline,
    }));

    await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
    drive.notificationSent = true;
    await drive.save();

    res.json({ message: 'Notifications sent', count: eligibleStudents.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update drive
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(drive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE drive
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Drive.findByIdAndDelete(req.params.id);
    res.json({ message: 'Drive deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
