const mongoose = require('mongoose');

const darajaSchema = new mongoose.Schema({
  consumerKey: String,
  consumerSecret: String,
  passKey: String,
  shortCode: String,
  callbackUrl: String,
  environment: { type: String, default: 'sandbox' }
});

const routerCfgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  host: { type: String, required: true },
  port: { type: Number, default: 8728 },
  user: { type: String, required: true },
  password: { type: String, required: true },
  secure: { type: Boolean, default: false },
  hotspotInterface: { type: String, default: '' }
});

const packageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: { type: String, required: true },
  speed: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'WiFi Billing' },
    daraja: darajaSchema,
    routers: [routerCfgSchema],
    packages: [packageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
