const { RouterOSAPI } = require('node-routeros');
const { config, assertConfig } = require('../config/config');

function normalizeMac(macAddress) {
  const cleaned = String(macAddress || '').trim().toUpperCase();
  const isValid = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(cleaned);

  if (!isValid) {
    throw new Error('Invalid MAC address format. Expected: AA:BB:CC:DD:EE:FF');
  }

  return cleaned;
}

class RouterService {
  constructor() {
    this.connection = null;
  }

  async connect() {
    assertConfig([
      { key: 'ROUTER_HOST', value: config.router.host },
      { key: 'ROUTER_USER', value: config.router.user },
      { key: 'ROUTER_PASSWORD', value: config.router.password }
    ]);

    this.connection = new RouterOSAPI({
      host: config.router.host,
      user: config.router.user,
      password: config.router.password,
      port: config.router.port,
      timeout: 10000,
      tls: config.router.secure
    });

    await this.connection.connect();
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async ensureConnection() {
    if (!this.connection) {
      await this.connect();
    }
  }

  async removeExistingUser(username) {
    const users = await this.connection.write('/ip/hotspot/user/print', [`?name=${username}`]);
    for (const user of users) {
      await this.connection.write('/ip/hotspot/user/remove', [`=.id=${user['.id']}`]);
    }
  }

  async clearCookiesAndActiveSessions(username, macAddress) {
    const activeSessions = await this.connection.write('/ip/hotspot/active/print', [`?user=${username}`]);
    for (const session of activeSessions) {
      await this.connection.write('/ip/hotspot/active/remove', [`=.id=${session['.id']}`]);
    }

    const cookies = await this.connection.write('/ip/hotspot/cookie/print', [`?mac-address=${macAddress}`]);
    for (const cookie of cookies) {
      await this.connection.write('/ip/hotspot/cookie/remove', [`=.id=${cookie['.id']}`]);
    }
  }

  async provisionUser(macAddress, duration) {
    const normalizedMac = normalizeMac(macAddress);
    const username = normalizedMac;
    const password = normalizedMac;

    try {
      await this.ensureConnection();

      await this.removeExistingUser(username);

      await this.connection.write('/ip/hotspot/user/add', [
        `=name=${username}`,
        `=password=${password}`,
        `=comment=Auto-provisioned via M-Pesa`,
        `=limit-uptime=${duration}`
      ]);

      await this.clearCookiesAndActiveSessions(username, normalizedMac);

      return {
        success: true,
        username,
        duration
      };
    } catch (error) {
      throw new Error(`Router provisioning failed: ${error.message}`);
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = {
  RouterService,
  normalizeMac
};
