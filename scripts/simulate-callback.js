const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const CALLBACK_URL = process.env.LOCAL_CALLBACK_URL || 'http://localhost:3000/api/callback';
const SECRET = process.env.DARAJA_CALLBACK_SECRET || '';
const PHONE = process.env.TEST_PHONE || '254700000000';
const AMOUNT = process.env.TEST_AMOUNT || '10';
const MAC = process.env.TEST_MAC || 'AA:BB:CC:DD:EE:FF';

async function simulate() {
  const payload = {
    Body: {
      stkCallback: {
        MerchantRequestID: '12345',
        CheckoutRequestID: `ck_${Date.now()}`,
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
        CallbackMetadata: {
          Item: [
            { Name: 'Amount', Value: AMOUNT },
            { Name: 'MpesaReceiptNumber', Value: `LN${Date.now()}` },
            { Name: 'Balance' },
            { Name: 'TransactionDate', Value: new Date().toISOString() },
            { Name: 'PhoneNumber', Value: PHONE }
          ]
        }
      }
    }
  };

  const payloadStr = JSON.stringify(payload);
  const signature = SECRET ? crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex') : '';

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (signature) headers['x-callback-signature'] = signature;

    console.log('Posting simulated callback to', CALLBACK_URL);
    const res = await axios.post(CALLBACK_URL, payload, { headers, timeout: 10000 });
    console.log('Callback response status', res.status);
  } catch (err) {
    console.error('Callback post failed:', err.message || err);
    process.exit(1);
  }

  // If router command log file is configured, show recent lines
  const logPath = process.env.ROUTER_COMMAND_LOGFILE || '';
  if (logPath && fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n').slice(-50).join('\n');
    console.log('--- Recent router command log ---');
    console.log(lines);
  } else {
    console.log('No router command log file configured or file missing. Set ROUTER_COMMAND_LOGFILE to inspect commands.');
  }
}

simulate().catch((e) => { console.error(e.message || e); process.exit(1); });
