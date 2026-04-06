const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/analytics?year=2026  — accessible to ALL authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const filterYear = req.query.year ? parseInt(req.query.year) : null;

    const [allApplications, students] = await Promise.all([
      Application.find()
        .populate('student', 'name branch graduationYear')
        .populate({ path: 'drive', populate: { path: 'job', populate: 'company' } }),
      User.find({ role: 'student' }).select('branch graduationYear'),
    ]);

    // Year-filtered applications
    const applications = filterYear
      ? allApplications.filter(a => a.student?.graduationYear === filterYear)
      : allApplications;

    const selected = applications.filter(a => a.status === 'selected');

    // All unique departments across all students
    const allBranches = [...new Set(students.map(s => s.branch).filter(Boolean))].sort();

    // Department × status breakdown (for grouped bar chart)
    const deptGrouped = allBranches.map(branch => {
      const branchApps = applications.filter(a => a.student?.branch === branch);
      return {
        branch,
        applied: branchApps.filter(a => a.status === 'applied').length,
        shortlisted: branchApps.filter(a => a.status === 'shortlisted').length,
        selected: branchApps.filter(a => a.status === 'selected').length,
        rejected: branchApps.filter(a => a.status === 'rejected').length,
        total: branchApps.length,
      };
    }).filter(d => d.total > 0);

    // Overall summary for the filtered year
    const placedIds = new Set(selected.map(a => a.student?._id?.toString()).filter(Boolean));
    const placedCount = placedIds.size;
    const yearStudents = filterYear
      ? students.filter(s => s.graduationYear === filterYear).length
      : students.length;

    // Status breakdown pie
    const statusBreakdown = ['applied', 'shortlisted', 'selected', 'rejected'].map(s => ({
      label: s.charAt(0).toUpperCase() + s.slice(1),
      value: applications.filter(a => a.status === s).length,
    }));

    // Available years (for dropdown hint)
    const availableYears = [...new Set(
      allApplications.map(a => a.student?.graduationYear).filter(Boolean)
    )].sort();

    // Company-wise placements (filtered)
    const compPlaced = {};
    selected.forEach(a => {
      const name = a.drive?.job?.company?.name || 'Unknown';
      compPlaced[name] = (compPlaced[name] || 0) + 1;
    });

    res.json({
      year: filterYear,
      availableYears,
      summary: {
        totalStudents: yearStudents,
        placedCount,
        placementRate: yearStudents > 0 ? Math.round((placedCount / yearStudents) * 100) : 0,
        totalApplications: applications.length,
      },
      placementPie: [
        { label: 'Placed', value: placedCount },
        { label: 'Not Placed', value: Math.max(0, yearStudents - placedCount) },
      ],
      statusBreakdown,
      deptGrouped,
      topCompanies: Object.entries(compPlaced)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
