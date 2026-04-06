const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'selected', 'rejected'],
      default: 'applied',
    },
    adminRemarks: { type: String },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
