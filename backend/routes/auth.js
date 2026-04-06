const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { protect } = require('../middleware/auth');
const { sendResetEmail, sendVerificationEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  rollNumber: user.rollNumber,
  branch: user.branch,
  cgpa: user.cgpa,
  skills: user.skills,
  graduationYear: user.graduationYear,
  linkedin: user.linkedin,
  github: user.github,
  portfolio: user.portfolio,
  resumeUrl: user.resumeUrl,
  isProfileComplete: user.isProfileComplete,
  isPlaced: user.isPlaced,
  placedCompany: user.placedCompany,
  placedPackage: user.placedPackage,
  offerLetterUrl: user.offerLetterUrl,
  isEmailVerified: user.isEmailVerified,
  twoFactorEnabled: user.twoFactorEnabled,
  token: generateToken(user._id),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, branch } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name, email, password,
      role: role || 'student',
      rollNumber, branch,
      emailVerifyToken: verifyToken,
      isEmailVerified: false,
    });

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/verify-email?token=${verifyToken}`;
    try {
      await sendVerificationEmail(email, name, verifyLink);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
    }

    res.status(201).json({
      ...userResponse(user),
      message: 'Registered! Please check your email to verify your account.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ emailVerifyToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    user.lastActive = new Date();
    await user.save();

    res.json(userResponse(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    const token = await PasswordReset.createToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await sendResetEmail(email, user.name, resetLink);

    res.json({ message: 'Password reset link sent to your email. Please check your inbox.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const resetRecord = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gte: new Date() },
    });

    if (!resetRecord) return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new one.' });

    const user = await User.findById(resetRecord.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();

    res.json({ message: 'Password reset successful! You can now login with your new password.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;