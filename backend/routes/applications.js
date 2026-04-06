const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Drive = require('../models/Drive');
const Job = require('../models/Job');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

// GET student's own applications
router.get('/my', protect, studentOnly, async (req, res) => {
  try {
    const apps = await Application.find({ student: req.user._id })
      .populate({ path: 'drive', populate: { path: 'job', populate: 'company' } })
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all applications for a drive (admin)
router.get('/drive/:driveId', protect, adminOnly, async (req, res) => {
  try {
    const apps = await Application.find({ drive: req.params.driveId })
      .populate('student', 'name email branch cgpa rollNumber phone')
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all applications (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('student', 'name email branch cgpa')
      .populate({ path: 'drive', populate: { path: 'job', populate: 'company' } })
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST apply for a drive
router.post('/', protect, studentOnly, async (req, res) => {
  try {
    const { driveId } = req.body;
    const student = req.user;

    const drive = await Drive.findById(driveId).populate('job');
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    // Check deadline
    if (new Date() > drive.deadline)
      return res.status(400).json({ message: 'Application deadline has passed' });

    const job = drive.job;

    // Eligibility check
    if (student.cgpa < job.minCGPA)
      return res.status(400).json({ message: `Minimum CGPA required: ${job.minCGPA}` });

    if (!job.eligibleBranches.includes(student.branch))
      return res.status(400).json({ message: 'Your branch is not eligible for this job' });

    // Duplicate check
    const existing = await Application.findOne({ student: student._id, drive: driveId });
    if (existing) return res.status(400).json({ message: 'Already applied for this drive' });

    const application = await Application.create({
      student: student._id,
      drive: driveId,
      job: job._id,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update application status (admin)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status, adminRemarks },
      { new: true }
    ).populate('student', 'name email');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
