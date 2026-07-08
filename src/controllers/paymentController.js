const crypto = require('crypto');
const axios = require('axios');
const Transaction = require('../models/Transaction');
const { initiateStkPush, normalizeKenyanPhone } = require('../services/mpesa');
const { normalizeMac } = require('../services/router');
const routerManager = require('../services/routerManager');
const Setting = require('../models/Setting');
const { config } = require('../config/config');

function getMetadataValue(metadataItems, key) {
  const item = metadataItems.find((entry) => entry.Name === key);
  return item ? item.Value : null;
}

async function initiatePayment(req, res) {
  try {
    const { phone, macAddress, ipAddress = '', packageKey } = req.body;

    // Cloudflare Turnstile token must be submitted from the client
    const turnstileToken = req.body['cf-turnstile-response'] || req.body.turnstileToken || req.headers['cf-turnstile-response'];

    if (!turnstileToken) {
      return res.status(400).json({ success: false, message: 'Turnstile token missing or incomplete' });
    }

    // Verify Turnstile token server-side before performing STK push
    try {
      const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const params = new URLSearchParams();
      params.append('secret', (config.turnstile && config.turnstile.secretKey) || '');
      params.append('response', turnstileToken);
      if (req.ip) params.append('remoteip', req.ip);

      const verifyResponse = await axios.post(verifyUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000
      });

      const verified = verifyResponse && verifyResponse.data && verifyResponse.data.success;
      if (!verified) {
        return res.status(403).json({ success: false, message: 'Captcha verification failed' });
      }
    } catch (verifyErr) {
      // Treat slow/unavailable Turnstile as a transient error and reject conservatively
      console.error('Turnstile verify error:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
      return res.status(503).json({ success: false, message: 'Captcha verification service unavailable. Try again later.' });
    }

    if (!phone || !macAddress || !packageKey) {
      return res.status(400).json({
        success: false,
        message: 'phone, macAddress, and packageKey are required'
      });
    }

    const settings = (await Setting.findOne().lean().exec()) || {};
    const selectedPackage = (settings.packages || []).find((p) => p.key === packageKey);
    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package selected'
      });
    }

    const normalizedPhone = normalizeKenyanPhone(phone);
    const normalizedMac = normalizeMac(macAddress);

    const stkResponse = await initiateStkPush({
      phoneNumber: normalizedPhone,
      amount: selectedPackage.amount,
      accountReference: `WIFI-${selectedPackage.name}`,
      transactionDesc: `Wi-Fi package: ${selectedPackage.name}`
    });

    const transaction = await Transaction.create({
      phone: normalizedPhone,
      macAddress: normalizedMac,
      ipAddress,
      packageKey,
      packageName: selectedPackage.name,
      duration: selectedPackage.duration,
      amount: selectedPackage.amount,
      status: 'PENDING',
      checkoutRequestId: stkResponse.CheckoutRequestID || '',
      merchantRequestId: stkResponse.MerchantRequestID || '',
      resultDesc: stkResponse.ResponseDescription || 'Awaiting customer PIN entry'
    });

    return res.status(202).json({
      success: true,
      message: 'STK push sent. Complete payment on your phone.',
      data: {
        transactionId: transaction._id,
        checkoutRequestId: transaction.checkoutRequestId,
        phone: normalizedPhone,
        amount: selectedPackage.amount,
        packageName: selectedPackage.name
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

function callback(req, res) {
  // If a callback secret is configured, prefer signature verification.
  const configuredSecret = config.mpesa.callbackSecret || '';

  if (configuredSecret) {
    const incomingSig = (req.headers['x-callback-signature'] || '').trim();

    // Require an HMAC-SHA256 hex signature in `x-callback-signature` when callback secret is set.
    if (!incomingSig) {
      return res.status(403).json({ ResultCode: 1, ResultDesc: 'Forbidden - missing signature' });
    }

    const payload = req.rawBody || JSON.stringify(req.body || {});
    const expected = crypto.createHmac('sha256', configuredSecret).update(payload).digest('hex');

    // Prevent timing attacks and ensure same-length buffers before comparing
    const expectedBuf = Buffer.from(expected, 'hex');
    const incomingBuf = Buffer.from(incomingSig, 'hex');
    if (expectedBuf.length !== incomingBuf.length || !crypto.timingSafeEqual(expectedBuf, incomingBuf)) {
      return res.status(403).json({ ResultCode: 1, ResultDesc: 'Forbidden - invalid signature' });
    }
  }

  // Acknowledge quickly to avoid retries from Daraja
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Callback accepted' });

  setImmediate(async () => {
    try {
      const stkCallback = req.body?.Body?.stkCallback;
      if (!stkCallback) {
        return;
      }

      const {
        MerchantRequestID: merchantRequestId,
        CheckoutRequestID: checkoutRequestId,
        ResultCode: resultCode,
        ResultDesc: resultDesc,
        CallbackMetadata: callbackMetadata
      } = stkCallback;

      const metadataItems = callbackMetadata?.Item || [];
      const amount = Number(getMetadataValue(metadataItems, 'Amount') || 0);
      const receipt = getMetadataValue(metadataItems, 'MpesaReceiptNumber') || '';
      const phone = String(getMetadataValue(metadataItems, 'PhoneNumber') || '');

      let transaction = await Transaction.findOne({ checkoutRequestId });

      if (!transaction) {
        // If we cannot find the original transaction, create a minimal record.
        transaction = new Transaction({
          phone,
          macAddress: '00:00:00:00:00:00',
          packageKey: 'unknown',
          packageName: 'Unknown',
          duration: '1h',
          amount,
          checkoutRequestId,
          merchantRequestId,
          status: 'PENDING'
        });
      }

      transaction.rawCallback = stkCallback;
      transaction.resultCode = Number(resultCode);
      transaction.resultDesc = resultDesc;
      transaction.merchantRequestId = merchantRequestId;

      if (Number(resultCode) === 0) {
        transaction.status = 'SUCCESS';
        transaction.mpesaReceiptNumber = receipt;
        transaction.amount = amount || transaction.amount;
        transaction.phone = phone || transaction.phone;

        try {
          if (transaction.macAddress !== '00:00:00:00:00:00') {
            // choose first router configured in settings, or default env router
            const settings = (await Setting.findOne().lean().exec()) || {};
            const routerCfg = (settings.routers && settings.routers[0]) || null;
            if (routerCfg && routerCfg._id) {
              await routerManager.provisionOnRouter(routerCfg._id, transaction.macAddress, transaction.duration);
            } else if (routerCfg) {
              // if no stored id (freshly created array from env), attempt with provided fields
              const r = new (require('../services/router').RouterService)();
              r.setRouterConfig(routerCfg);
              await r.provisionUser(transaction.macAddress, transaction.duration);
            } else {
              // fallback to env-based router service
              const r = new (require('../services/router').RouterService)();
              await r.provisionUser(transaction.macAddress, transaction.duration);
            }

            transaction.routerProvisioned = true;
            transaction.routerProvisionError = '';
          } else {
            transaction.routerProvisioned = false;
            transaction.routerProvisionError = 'Original transaction context not found';
          }
        } catch (routerError) {
          transaction.routerProvisioned = false;
          transaction.routerProvisionError = routerError.message;
        }
      } else {
        transaction.status = 'FAILED';
        transaction.routerProvisioned = false;
      }

      await transaction.save();
    } catch (error) {
      console.error('Callback processing error:', error.message);
    }
  });
}

async function paymentStatus(req, res) {
  try {
    const normalizedPhone = normalizeKenyanPhone(req.params.phone);

    const transaction = await Transaction.findOne({ phone: normalizedPhone }).sort({ createdAt: -1 });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'No transaction found for this phone number'
      });
    }

    const isUsable = transaction.status === 'SUCCESS' && transaction.routerProvisioned;

    return res.status(200).json({
      success: true,
      data: {
        status: transaction.status,
        paymentConfirmed: transaction.status === 'SUCCESS',
        routerProvisioned: transaction.routerProvisioned,
        internetReady: isUsable,
        amount: transaction.amount,
        receipt: transaction.mpesaReceiptNumber,
        phone: transaction.phone,
        packageName: transaction.packageName,
        resultCode: transaction.resultCode,
        resultDesc: transaction.resultDesc,
        updatedAt: transaction.updatedAt,
        routerProvisionError: transaction.routerProvisionError
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function listPackages(req, res) {
  res.status(200).json({ success: true, data: PACKAGES });
}

module.exports = {
  initiatePayment,
  callback,
  paymentStatus,
  listPackages
};
