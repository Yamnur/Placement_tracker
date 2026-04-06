const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    description: { type: String },
    role: { type: String, required: true },
    salary: { type: Number, required: true },
    salaryUnit: { type: String, default: 'LPA' },
    type: { type: String, enum: ['Full-time', 'Internship', 'Contract'], default: 'Full-time' },

    // Eligibility criteria
    minCGPA: { type: Number, required: true, min: 0, max: 10 },
    eligibleBranches: {
      type: [String],
      enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'CHEM', 'OTHER'],
      required: true,
    },
    skills: [{ type: String }],
    backlogAllowed: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
