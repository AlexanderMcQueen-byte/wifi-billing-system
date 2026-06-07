const axios = require('axios');
const { config, assertConfig } = require('../config/config');

function normalizeKenyanPhone(phone) {
  const cleaned = String(phone || '').replace(/\s+/g, '');

  if (/^\+254\d{9}$/.test(cleaned)) {
    return cleaned.replace('+', '');
  }

  if (/^254\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^0\d{9}$/.test(cleaned)) {
    return `254${cleaned.slice(1)}`;
  }

  throw new Error('Invalid phone number. Use a valid Kenyan mobile number.');
}

function generateTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('');
}

function generatePassword(timestamp) {
  assertConfig([
    { key: 'DARAJA_SHORTCODE', value: config.mpesa.shortCode },
    { key: 'DARAJA_PASSKEY', value: config.mpesa.passKey }
  ]);

  const payload = `${config.mpesa.shortCode}${config.mpesa.passKey}${timestamp}`;
  return Buffer.from(payload).toString('base64');
}

async function getAccessToken() {
  assertConfig([
    { key: 'DARAJA_CONSUMER_KEY', value: config.mpesa.consumerKey },
    { key: 'DARAJA_CONSUMER_SECRET', value: config.mpesa.consumerSecret }
  ]);

  const auth = Buffer.from(`${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`).toString('base64');

  const url = `${config.mpesa.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`
      },
      timeout: 15000
    });

    if (!response.data?.access_token) {
      throw new Error('Daraja OAuth token missing in response');
    }

    return response.data.access_token;
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Failed to generate Daraja access token: ${JSON.stringify(message)}`);
  }
}

async function initiateStkPush({ phoneNumber, amount, accountReference, transactionDesc }) {
  assertConfig([
    { key: 'DARAJA_SHORTCODE', value: config.mpesa.shortCode },
    { key: 'DARAJA_CALLBACK_URL', value: config.mpesa.callbackUrl }
  ]);

  const token = await getAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const normalizedPhone = normalizeKenyanPhone(phoneNumber);

  const payload = {
    BusinessShortCode: config.mpesa.shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Number(amount),
    PartyA: normalizedPhone,
    PartyB: config.mpesa.shortCode,
    PhoneNumber: normalizedPhone,
    CallBackURL: config.mpesa.callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc
  };

  try {
    const response = await axios.post(
      `${config.mpesa.baseUrl}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    return {
      ...response.data,
      normalizedPhone
    };
  } catch (error) {
    const data = error.response?.data || error.message;
    throw new Error(`STK push failed: ${JSON.stringify(data)}`);
  }
}

module.exports = {
  normalizeKenyanPhone,
  generateTimestamp,
  generatePassword,
  getAccessToken,
  initiateStkPush
};
