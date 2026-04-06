const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect, adminOnly } = require('../middleware/auth');
const { materialUpload } = require('../middleware/upload');

// GET all materials
router.get('/', protect, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload material (admin)
router.post('/', protect, adminOnly, materialUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const material = await Material.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'other',
      fileUrl: `/uploads/materials/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE material (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
