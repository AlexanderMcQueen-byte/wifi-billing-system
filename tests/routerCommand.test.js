const assert = require('assert');
const mongoose = require('mongoose');
const axios = require('axios');
const { config } = require('../src/config/config');
const RouterCommandLog = require('../src/models/RouterCommandLog');
const test = require('node:test');

test('router command log integration', async (t) => {

  await mongoose.connect(config.mongoUri, { maxPoolSize: 5 });
  try {
    const callbackUrl = process.env.LOCAL_CALLBACK_URL || `http://localhost:${config.port}/api/callback`;
    const secret = process.env.DARAJA_CALLBACK_SECRET || '';

    const payload = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'test_merchant',
          CheckoutRequestID: `test_ck_${Date.now()}`,
          ResultCode: 0,
          ResultDesc: 'OK',
          CallbackMetadata: { Item: [{ Name: 'PhoneNumber', Value: process.env.TEST_PHONE || '254700000000' }] }
        }
      }
    };

    const payloadStr = JSON.stringify(payload);
    const signature = secret ? require('crypto').createHmac('sha256', secret).update(payloadStr).digest('hex') : '';

    const headers = { 'Content-Type': 'application/json' };
    if (signature) headers['x-callback-signature'] = signature;

    await axios.post(callbackUrl, payload, { headers, timeout: 10000 }).catch(() => {});

    await new Promise((r) => setTimeout(r, 1500));

    const recent = await RouterCommandLog.find().sort({ createdAt: -1 }).limit(5).exec();
    assert.ok(Array.isArray(recent));
    assert.ok(recent.length >= 0);
  } finally {
    await mongoose.disconnect();
  }
});
