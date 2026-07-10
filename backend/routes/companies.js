const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { protect, adminOnly } = require('../middleware/auth');

// GET all companies
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create company (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, website, industry, location, applicationLink } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await Company.create({
      name: name.trim(),
      description,
      website,
      industry,
      location,
      applicationLink,
      createdBy: req.user._id,
    });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create company' });
  }
});

// PUT update company
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE company
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
