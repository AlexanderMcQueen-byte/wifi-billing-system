const Transaction = require('../models/Transaction');
const { initiateStkPush, normalizeKenyanPhone } = require('../services/mpesa');
const { RouterService, normalizeMac } = require('../services/router');

const routerService = new RouterService();

const PACKAGES = {
  hourly: { name: '1 Hour', amount: 20, duration: '1h' },
  daily: { name: '24 Hours', amount: 50, duration: '1d' },
  weekly: { name: '1 Week', amount: 250, duration: '7d' }
};

function getMetadataValue(metadataItems, key) {
  const item = metadataItems.find((entry) => entry.Name === key);
  return item ? item.Value : null;
}

async function initiatePayment(req, res) {
  try {
    const { phone, macAddress, ipAddress = '', packageKey } = req.body;

    if (!phone || !macAddress || !packageKey) {
      return res.status(400).json({
        success: false,
        message: 'phone, macAddress, and packageKey are required'
      });
    }

    const selectedPackage = PACKAGES[packageKey];
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
            await routerService.provisionUser(transaction.macAddress, transaction.duration);
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
