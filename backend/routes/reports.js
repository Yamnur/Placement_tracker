const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const Drive = require('../models/Drive');
const { protect, adminOnly } = require('../middleware/auth');

// Convert array of objects to CSV
function toCSV(headers, rows) {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  rows.forEach(row => lines.push(headers.map(h => escape(row[h])).join(',')));
  return lines.join('\n');
}

// GET /api/reports/placements.csv
router.get('/placements', protect, adminOnly, async (req, res) => {
  try {
    const { year, status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const apps = await Application.find(filter)
      .populate('student', 'name email branch cgpa rollNumber phone graduationYear isPlaced placedPackage')
      .populate({ path: 'drive', populate: { path: 'job', populate: 'company' } })
      .sort({ createdAt: -1 });

    const filtered = year
      ? apps.filter(a => a.student?.graduationYear === parseInt(year))
      : apps;

    const headers = ['Name', 'Email', 'Roll Number', 'Branch', 'CGPA', 'Graduation Year', 'Phone', 'Company', 'Role', 'Package (LPA)', 'Status', 'Applied Date'];

    const rows = filtered.map(a => ({
      'Name': a.student?.name,
      'Email': a.student?.email,
      'Roll Number': a.student?.rollNumber,
      'Branch': a.student?.branch,
      'CGPA': a.student?.cgpa,
      'Graduation Year': a.student?.graduationYear,
      'Phone': a.student?.phone,
      'Company': a.drive?.job?.company?.name,
      'Role': a.drive?.job?.role,
      'Package (LPA)': a.drive?.job?.salary,
      'Status': a.status,
      'Applied Date': new Date(a.appliedAt || a.createdAt).toLocaleDateString('en-IN'),
    }));

    const csv = toCSV(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="placement-report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/students.csv
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });

    const headers = ['Name', 'Email', 'Roll Number', 'Branch', 'CGPA', 'Graduation Year', 'Phone', 'Skills', 'Placed', 'Placed Company', 'Package (LPA)', 'Profile Complete', 'Registered'];

    const rows = students.map(s => ({
      'Name': s.name,
      'Email': s.email,
      'Roll Number': s.rollNumber,
      'Branch': s.branch,
      'CGPA': s.cgpa,
      'Graduation Year': s.graduationYear,
      'Phone': s.phone,
      'Skills': (s.skills || []).join('; '),
      'Placed': s.isPlaced ? 'Yes' : 'No',
      'Placed Company': s.placedCompany,
      'Package (LPA)': s.placedPackage,
      'Profile Complete': s.isProfileComplete ? 'Yes' : 'No',
      'Registered': new Date(s.createdAt).toLocaleDateString('en-IN'),
    }));

    const csv = toCSV(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students-report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/drives.csv
router.get('/drives', protect, adminOnly, async (req, res) => {
  try {
    const drives = await Drive.find()
      .populate({ path: 'job', populate: 'company' })
      .sort({ driveDate: -1 });

    const headers = ['Title', 'Company', 'Role', 'Package (LPA)', 'Drive Date', 'Deadline', 'Venue', 'Status', 'Min CGPA', 'Eligible Branches'];

    const rows = drives.map(d => ({
      'Title': d.title,
      'Company': d.job?.company?.name,
      'Role': d.job?.role,
      'Package (LPA)': d.job?.salary,
      'Drive Date': new Date(d.driveDate).toLocaleDateString('en-IN'),
      'Deadline': new Date(d.deadline).toLocaleDateString('en-IN'),
      'Venue': d.venue,
      'Status': d.status,
      'Min CGPA': d.job?.minCGPA,
      'Eligible Branches': (d.job?.eligibleBranches || []).join('; '),
    }));

    const csv = toCSV(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="drives-report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
