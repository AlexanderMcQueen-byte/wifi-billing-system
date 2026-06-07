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
    this.routerCfg = null; // optional runtime router configuration
  }
  async connect() {
    const use = this.routerCfg || config.router;

    assertConfig([
      { key: 'ROUTER_HOST', value: use.host },
      { key: 'ROUTER_USER', value: use.user },
      { key: 'ROUTER_PASSWORD', value: use.password }
    ]);

    this.connection = new RouterOSAPI({
      host: use.host,
      user: use.user,
      password: use.password,
      port: use.port || 8728,
      timeout: 10000,
      tls: !!use.secure
    });

    await this.connection.connect();
  }

  setRouterConfig(routerCfg) {
    this.routerCfg = routerCfg;
  }

  async writeCmd(cmd, args) {
    // Log command to file if configured (useful for testing/verification)
    let resp = null;
    try {
      if (config.router.commandLogFile) {
        const fs = require('fs');
        const entry = `${new Date().toISOString()} | ${cmd} | ${JSON.stringify(args)}\n`;
        fs.appendFileSync(config.router.commandLogFile, entry);
      }
    } catch (logErr) {
      console.warn('Router command log error:', logErr.message || logErr);
    }

    try {
      resp = await this.connection.write(cmd, args);
      return resp;
    } finally {
      // Persist to DB if available for later verification (non-blocking)
      try {
        // lazy require to avoid circulars until mongoose is ready
        const RouterCommandLog = require('../models/RouterCommandLog');
        const doc = new RouterCommandLog({ command: cmd, args: Array.isArray(args) ? { args } : args, response: resp, success: true });
        // write without awaiting to avoid blocking router ops; if mongoose not connected this will fail silently
        doc.save().catch((e) => console.warn('RouterCommandLog save failed:', e.message || e));
      } catch (e) {
        // ignore logging errors
      }
    }
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
    const users = await this.writeCmd('/ip/hotspot/user/print', [`?name=${username}`]);
    for (const user of users) {
      await this.writeCmd('/ip/hotspot/user/remove', [`=.id=${user['.id']}`]);
    }
  }

  async clearCookiesAndActiveSessions(username, macAddress) {
    const activeSessions = await this.writeCmd('/ip/hotspot/active/print', [`?user=${username}`]);
    for (const session of activeSessions) {
      await this.writeCmd('/ip/hotspot/active/remove', [`=.id=${session['.id']}`]);
    }

    const cookies = await this.writeCmd('/ip/hotspot/cookie/print', [`?mac-address=${macAddress}`]);
    for (const cookie of cookies) {
      await this.writeCmd('/ip/hotspot/cookie/remove', [`=.id=${cookie['.id']}`]);
    }
  }

  async provisionUser(macAddress, duration) {
    const normalizedMac = normalizeMac(macAddress);
    const username = normalizedMac;
    const password = normalizedMac;

    try {
      await this.ensureConnection();


      // Ensure hotspot user profile enforces single shared user
      try {
        const profiles = await this.connection.write('/ip/hotspot/user/profile/print');
        const defaultProfile = profiles.find((p) => p.name === 'default') || profiles[0];
        if (defaultProfile) {
          await this.connection.write('/ip/hotspot/user/profile/set', [`=.id=${defaultProfile['.id']}`, `=shared-users=1`]);
        }
      } catch (pfErr) {
        // Non-fatal: log and continue
        console.warn('Could not enforce shared-users on profile:', pfErr.message || pfErr);
      }

      // Idempotent provisioning: if user exists, update; otherwise add
      const existingUsers = await this.writeCmd('/ip/hotspot/user/print', [`?name=${username}`]);
      if (existingUsers && existingUsers.length > 0) {
        // Update limit and comment
        for (const u of existingUsers) {
          await this.writeCmd('/ip/hotspot/user/set', [`=.id=${u['.id']}`, `=password=${password}`, `=comment=Auto-provisioned via M-Pesa`, `=limit-uptime=${duration}`]);
        }
      } else {
        await this.writeCmd('/ip/hotspot/user/add', [
          `=name=${username}`,
          `=password=${password}`,
          `=comment=Auto-provisioned via M-Pesa`,
          `=limit-uptime=${duration}`
        ]);
      }

      // Create an IP binding entry to tie this MAC to the hotspot system (prevents reuse)
      try {
        const existingBindings = await this.writeCmd('/ip/hotspot/ip-binding/print', [`?mac-address=${normalizedMac}`]);
        if (!existingBindings || existingBindings.length === 0) {
          await this.writeCmd('/ip/hotspot/ip-binding/add', [
            `=mac-address=${normalizedMac}`,
            `=type=regular`,
            `=comment=Locked to paid device ${username}`
          ]);
        } else {
          // Optionally update comment if exists
          for (const b of existingBindings) {
            await this.writeCmd('/ip/hotspot/ip-binding/set', [`=.id=${b['.id']}`, `=comment=Locked to paid device ${username}`]);
          }
        }
      } catch (bindErr) {
        console.warn('Could not add ip-binding for MAC:', bindErr.message || bindErr);
      }

      // Clear stale sessions/cookies for this username/MAC so login is immediate
      await this.clearCookiesAndActiveSessions(username, normalizedMac);

      // Optional: if a hotspot interface is configured, add a mangle rule to limit TTL
      // This helps prevent tethering by forcing TTL to 1 for forwarded packets from hotspot
      try {
        if (config.router.hotspotInterface) {
          // Idempotent add: check existing similar mangle rules
          const existing = await this.writeCmd('/ip/firewall/mangle/print', [`?comment=Anti-tethering TTL limit for hotspot users`]);
          if (!existing || existing.length === 0) {
            await this.writeCmd('/ip/firewall/mangle/add', [
              `=chain=prerouting`,
              `=in-interface=${config.router.hotspotInterface}`,
              `=action=change-ttl`,
              `=new-ttl=1`,
              `=comment=Anti-tethering TTL limit for hotspot users`
            ]);
          }
        }
      } catch (mErr) {
        console.warn('Could not add TTL mangle rule:', mErr.message || mErr);
      }

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
