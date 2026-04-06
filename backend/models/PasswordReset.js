const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

passwordResetSchema.statics.createToken = async function (userId) {
  await this.deleteMany({ user: userId });
  const token = crypto.randomBytes(32).toString('hex');
  await this.create({
    user: userId,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });
  return token;
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
