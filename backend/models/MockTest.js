const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
});

const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [{ type: Number }],
  score: { type: Number },
  total: { type: Number },
  percentage: { type: Number },
  timeTaken: { type: Number }, // seconds
  completedAt: { type: Date, default: Date.now },
});

const mockTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['aptitude', 'coding', 'verbal', 'technical', 'hr', 'general'], default: 'aptitude' },
    duration: { type: Number, required: true }, // minutes
    questions: [questionSchema],
    attempts: [attemptSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MockTest', mockTestSchema);
