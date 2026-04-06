const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
    company: { type: String, required: true },
    role: { type: String, required: true },
    outcome: { type: String, enum: ['selected', 'rejected', 'pending'], default: 'pending' },
    rounds: [{ name: String, description: String, difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] } }],
    overallExperience: { type: String, required: true },
    tips: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    isAnonymous: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    package: { type: Number },
    interviewDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
