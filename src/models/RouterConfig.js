const mongoose = require('mongoose');

const routerConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    host: { type: String, required: true },
    port: { type: Number, default: 8728 },
    user: { type: String, required: true },
    password: { type: String, required: true },
    secure: { type: Boolean, default: false },
    hotspotInterface: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RouterConfig', routerConfigSchema);
