const express = require('express');
const router = express.Router();
const InterviewExperience = require('../models/InterviewExperience');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

// GET all approved experiences (all users)
router.get('/', protect, async (req, res) => {
  try {
    const { company, outcome } = req.query;
    const filter = { isApproved: true };
    if (company) filter.company = new RegExp(company, 'i');
    if (outcome) filter.outcome = outcome;

    const experiences = await InterviewExperience.find(filter)
      .populate('student', 'name branch graduationYear')
      .sort({ createdAt: -1 });

    const result = experiences.map(e => ({
      ...e.toObject(),
      student: e.isAnonymous ? { name: 'Anonymous', branch: e.student?.branch } : e.student,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all experiences (admin - including unapproved)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const experiences = await InterviewExperience.find()
      .populate('student', 'name email branch')
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET own experiences (student)
router.get('/my', protect, studentOnly, async (req, res) => {
  try {
    const experiences = await InterviewExperience.find({ student: req.user._id })
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create experience (student)
router.post('/', protect, studentOnly, async (req, res) => {
  try {
    const exp = await InterviewExperience.create({
      ...req.body,
      student: req.user._id,
      isApproved: false,
    });
    res.status(201).json(exp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH approve/reject (admin)
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const exp = await InterviewExperience.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved },
      { new: true }
    );
    res.json(exp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE (admin or own student)
router.delete('/:id', protect, async (req, res) => {
  try {
    const exp = await InterviewExperience.findById(req.params.id);
    if (!exp) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && exp.student.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await exp.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
