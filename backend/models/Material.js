const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['aptitude', 'coding', 'hr', 'technical', 'resume', 'other'],
      default: 'other',
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    fileSize: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
