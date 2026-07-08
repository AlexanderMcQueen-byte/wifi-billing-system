const express = require('express');
const {
  initiatePayment,
  callback,
  paymentStatus,
  listPackages
} = require('../controllers/paymentController');

const rateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/packages', listPackages);
// legacy endpoint kept for compatibility
router.post('/pay', rateLimiter, initiatePayment);

// New recommended production path used by captive portal: /api/v1/payments/request-stk
router.post('/v1/payments/request-stk', rateLimiter, initiatePayment);
router.post('/callback', callback);
router.get('/status/:phone', paymentStatus);

module.exports = router;
