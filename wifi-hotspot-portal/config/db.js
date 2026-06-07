const mongoose = require('mongoose');
const { config } = require('./config');

async function connect() {
  return mongoose.connect(config.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000
  });
}

async function disconnect() {
  return mongoose.disconnect();
}

module.exports = { connect, disconnect };
const mongoose = require('mongoose');
const { config } = require('../../src/config/config');

async function connect() {
  return mongoose.connect(config.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000
  });
}

async function disconnect() {
  return mongoose.disconnect();
}

module.exports = { connect, disconnect };
