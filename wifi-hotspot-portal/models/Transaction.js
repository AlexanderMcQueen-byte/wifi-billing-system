const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    macAddress: { type: String, required: true, index: true },
    ipAddress: { type: String, default: '' },
    packageKey: { type: String, required: true },
    packageName: { type: String, required: true },
    duration: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    checkoutRequestId: { type: String, default: '', index: true },
    merchantRequestId: { type: String, default: '' },
    mpesaReceiptNumber: { type: String, default: '' },
    resultCode: { type: Number, default: null },
    resultDesc: { type: String, default: '' },
    routerProvisioned: { type: Boolean, default: false },
    routerProvisionError: { type: String, default: '' },
    rawCallback: { type: Object, default: null }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
// Re-export the Transaction model from the main project
module.exports = require('../../src/models/Transaction');
