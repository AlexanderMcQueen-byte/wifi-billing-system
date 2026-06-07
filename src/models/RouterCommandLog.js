const mongoose = require('mongoose');

const routerCommandLogSchema = new mongoose.Schema(
  {
    command: { type: String, required: true, index: true },
    args: { type: Object, default: {} },
    response: { type: Object, default: null },
    success: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RouterCommandLog', routerCommandLogSchema);
