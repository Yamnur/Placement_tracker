const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    driveDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    venue: { type: String },
    rounds: [{ name: String, description: String }],
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    notificationSent: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Auto-expire: mark active if before deadline, completed if after
driveSchema.virtual('isExpired').get(function () {
  return new Date() > this.deadline;
});

module.exports = mongoose.model('Drive', driveSchema);
