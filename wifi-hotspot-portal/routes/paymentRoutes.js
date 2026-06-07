const express = require('express');
const {
  initiatePayment,
  callback,
  paymentStatus,
  listPackages
} = require('../controllers/paymentController');

const router = express.Router();

router.get('/packages', listPackages);
router.post('/pay', initiatePayment);
router.post('/callback', callback);
router.get('/status/:phone', paymentStatus);

module.exports = router;
// Re-export routing from existing codebase
module.exports = require('../../src/routes/paymentRoutes');
