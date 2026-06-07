const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeKenyanPhone,
  generateTimestamp
} = require('../src/services/mpesa');
const { normalizeMac } = require('../src/services/router');

test('generateTimestamp returns YYYYMMDDHHmmss format', () => {
  const timestamp = generateTimestamp(new Date('2026-06-07T10:11:12Z'));
  assert.equal(timestamp.length, 14);
  assert.match(timestamp, /^\d{14}$/);
});

test('normalizeKenyanPhone converts local format to international format', () => {
  assert.equal(normalizeKenyanPhone('0712345678'), '254712345678');
  assert.equal(normalizeKenyanPhone('+254712345678'), '254712345678');
});

test('normalizeMac validates and normalizes mac address', () => {
  assert.equal(normalizeMac('aa:bb:cc:dd:ee:ff'), 'AA:BB:CC:DD:EE:FF');
});
