const express = require('express');
const router = express.Router();
const MockTest = require('../models/MockTest');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

// GET all active tests
router.get('/', protect, async (req, res) => {
  try {
    const tests = await MockTest.find({ isActive: true })
      .select('-questions.correctIndex -attempts')
      .sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single test (with questions, no correct answers)
router.get('/:id', protect, async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id).select('-questions.correctIndex -attempts');
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create test (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const test = await MockTest.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update test (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const test = await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE test (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await MockTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST submit attempt (student)
router.post('/:id/submit', protect, studentOnly, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const test = await MockTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Check already attempted
    const already = test.attempts.find(a => a.student?.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already attempted this test' });

    // Calculate score
    let score = 0;
    const results = test.questions.map((q, i) => {
      const correct = answers[i] === q.correctIndex;
      if (correct) score++;
      return {
        question: q.question,
        yourAnswer: q.options[answers[i]] ?? 'Not answered',
        correctAnswer: q.options[q.correctIndex],
        correct,
        explanation: q.explanation,
      };
    });

    const total = test.questions.length;
    const percentage = Math.round((score / total) * 100);

    test.attempts.push({
      student: req.user._id,
      answers,
      score,
      total,
      percentage,
      timeTaken,
    });
    await test.save();

    res.json({ score, total, percentage, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my attempt result for a test (student)
router.get('/:id/my-result', protect, studentOnly, async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Not found' });
    const attempt = test.attempts.find(a => a.student?.toString() === req.user._id.toString());
    if (!attempt) return res.status(404).json({ message: 'Not attempted yet' });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET leaderboard for a test (admin)
router.get('/:id/leaderboard', protect, adminOnly, async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id).populate('attempts.student', 'name branch rollNumber');
    if (!test) return res.status(404).json({ message: 'Not found' });
    const sorted = [...test.attempts].sort((a, b) => b.percentage - a.percentage || a.timeTaken - b.timeTaken);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
