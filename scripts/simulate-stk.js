(async () => {
  try {
    // Mock Turnstile verification and MPesa initiation
    const axios = require('axios');
    axios.post = async () => ({ data: { success: true } });

    const mpesa = require('../src/services/mpesa');
    mpesa.initiateStkPush = async ({ phoneNumber, amount }) => ({
      CheckoutRequestID: 'SIM-CHK-123',
      MerchantRequestID: 'SIM-MER-123',
      ResponseDescription: 'Simulation OK'
    });

    // Mock settings to include a package
    const Setting = require('../src/models/Setting');
    Setting.findOne = () => ({ lean: () => ({ exec: async () => ({ packages: [{ key: 'basic', name: 'Basic', amount: 10, duration: '1h' }] }) }) });

    // Mock Transaction to avoid DB dependency in this simulation
    const Transaction = require('../src/models/Transaction');
    Transaction.create = async (obj) => ({
      ...obj,
      _id: 'SIMTX123',
      checkoutRequestId: obj.checkoutRequestId || 'SIM-CHK-123',
      merchantRequestId: obj.merchantRequestId || 'SIM-MER-123',
      save: async function() { return this; }
    });

    const paymentController = require('../src/controllers/paymentController');

    // Build mock req/res
    const req = {
      body: {
        phone: '0712345678',
        macAddress: 'AA:BB:CC:DD:EE:FF',
        packageKey: 'basic',
        'cf-turnstile-response': 'dummy-token'
      },
      ip: '1.2.3.4'
    };

    let outStatus = null;
    let outJson = null;

    const res = {
      status(code) {
        outStatus = code;
        return this;
      },
      json(obj) {
        outJson = obj;
        console.log('Simulated response status:', outStatus);
        console.log('Simulated response body:', JSON.stringify(obj, null, 2));
      }
    };

    await paymentController.initiatePayment(req, res);
  } catch (err) {
    console.error('Simulation error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
