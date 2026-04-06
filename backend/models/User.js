const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },

    // Student-specific fields
    rollNumber: { type: String },
    branch: {
      type: String,
      enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'CHEM', 'OTHER'],
    },
    cgpa: { type: Number, min: 0, max: 10 },
    skills: [{ type: String }],
    resumeUrl: { type: String },
    phone: { type: String },
    graduationYear: { type: Number },
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    isProfileComplete: { type: Boolean, default: false },
    isPlaced: { type: Boolean, default: false },
    placedCompany: { type: String },
    placedPackage: { type: Number },
    offerLetterUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
