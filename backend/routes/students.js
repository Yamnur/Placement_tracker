const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');
const { resumeUpload, offerLetterUpload, bulkImportUpload } = require('../middleware/upload');

// GET all students (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single student (admin)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update own profile (student)
router.put('/profile', protect, studentOnly, async (req, res) => {
  try {
    const { name, phone, cgpa, branch, skills, graduationYear, linkedin, github, portfolio, isPlaced, placedCompany, placedPackage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (cgpa !== undefined) user.cgpa = cgpa;
    if (branch) user.branch = branch;
    if (skills) user.skills = skills;
    if (graduationYear) user.graduationYear = graduationYear;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (isPlaced !== undefined) user.isPlaced = isPlaced;
    if (placedCompany !== undefined) user.placedCompany = placedCompany;
    if (placedPackage !== undefined) user.placedPackage = placedPackage;

    // Mark profile complete if core fields are filled
    if (user.name && user.cgpa && user.branch && user.phone && user.graduationYear && user.skills && user.skills.length > 0) {
      user.isProfileComplete = true;
    } else {
      user.isProfileComplete = false;
    }

    await user.save();
    res.json({ ...user.toObject(), password: undefined });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload resume
router.post('/resume', protect, studentOnly, resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user._id);
    user.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    await user.save();
    res.json({ resumeUrl: user.resumeUrl, message: 'Resume uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload offer letter (student)
router.post('/offer-letter', protect, studentOnly, offerLetterUpload.single('offerLetter'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user._id);
    user.offerLetterUrl = `/uploads/offer-letters/${req.file.filename}`;
    user.isPlaced = true;
    if (req.body.company) user.placedCompany = req.body.company;
    if (req.body.package) user.placedPackage = parseFloat(req.body.package);
    await user.save();
    res.json({ offerLetterUrl: user.offerLetterUrl, message: 'Offer letter uploaded!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST bulk import students from Excel/CSV (admin)
router.post('/bulk-import', protect, adminOnly, bulkImportUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let rows = [];
    const ext = req.file.originalname.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      const text = req.file.buffer.toString('utf8');
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
      rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
        return Object.fromEntries(headers.map((h,i) => [h, vals[i] || '']));
      });
    } else {
      // xlsx handling via buffer - basic parsing
      return res.status(400).json({ message: 'Please upload a CSV file. For Excel, save as CSV first.' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of rows) {
      try {
        const email = row['email'] || row['Email'] || row['EMAIL'];
        const name = row['name'] || row['Name'] || row['NAME'];
        if (!email || !name) { results.errors.push(`Row missing name/email`); continue; }

        const exists = await User.findOne({ email });
        if (exists) { results.skipped++; continue; }

        const defaultPassword = (row['rollNumber'] || row['roll'] || 'Student@123').toString();

        await User.create({
          name,
          email,
          password: defaultPassword,
          role: 'student',
          rollNumber: row['rollNumber'] || row['roll_number'] || row['Roll Number'],
          branch: row['branch'] || row['Branch'],
          cgpa: parseFloat(row['cgpa'] || row['CGPA']) || undefined,
          phone: row['phone'] || row['Phone'],
          graduationYear: parseInt(row['graduationYear'] || row['graduation_year'] || row['Graduation Year']) || undefined,
        });
        results.created++;
      } catch (e) {
        results.errors.push(e.message);
      }
    }

    res.json({
      message: `Import complete: ${results.created} created, ${results.skipped} skipped`,
      ...results,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE student data (GDPR - admin or own student)
router.delete('/:id/gdpr', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isOwnRequest = req.user._id.toString() === req.params.id;
    if (!isAdmin && !isOwnRequest) return res.status(403).json({ message: 'Not authorized' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Anonymize instead of hard delete to preserve application history
    user.name = 'Deleted User';
    user.email = `deleted_${user._id}@deleted.com`;
    user.phone = undefined;
    user.resumeUrl = undefined;
    user.offerLetterUrl = undefined;
    user.skills = [];
    user.isProfileComplete = false;
    await user.save();

    res.json({ message: 'Student data anonymized per GDPR request' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH archive old drives (admin)
router.delete('/archive-old', protect, adminOnly, async (req, res) => {
  try {
    const { before } = req.query;
    const cutoff = before ? new Date(before) : new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const Drive = require('../models/Drive');
    const result = await Drive.updateMany(
      { driveDate: { $lt: cutoff }, status: { $ne: 'archived' } },
      { status: 'archived' }
    );
    res.json({ message: `${result.modifiedCount} drives archived` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
