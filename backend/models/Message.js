const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['student', 'admin'], required: true },
    text: { type: String, required: true, trim: true },
    isReadByAdmin: { type: Boolean, default: false },
    isReadByStudent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
