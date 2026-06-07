const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String }
  },
  { timestamps: true }
);

adminUserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

adminUserSchema.statics.createWithPassword = async function (email, password, name) {
  const hash = await bcrypt.hash(password, 10);
  return this.create({ email, passwordHash: hash, name });
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
