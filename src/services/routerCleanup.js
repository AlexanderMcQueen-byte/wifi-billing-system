const fs = require('fs');
const path = require('path');
const { RouterService } = require('./router');
const Transaction = require('../models/Transaction');
const { config } = require('../config/config');

/**
 * Cleanup job: remove ip-bindings and hotspot users for transactions older than CLEANUP_AGE_HOURS
 * - Only runs if ENABLE_CLEANUP=true in env
 */
async function cleanupOldBindings() {
  if (String(process.env.ENABLE_BINDING_CLEANUP || 'false').toLowerCase() !== 'true') {
    return;
  }

  const ageHours = Number(process.env.CLEANUP_AGE_HOURS || 48);
  const cutoff = new Date(Date.now() - ageHours * 3600 * 1000);

  const old = await Transaction.find({ routerProvisioned: true, updatedAt: { $lt: cutoff } }).limit(100).exec();
  if (!old || old.length === 0) return;

  const router = new RouterService();
  try {
    await router.connect();

    for (const tx of old) {
      try {
        const mac = tx.macAddress;
        const username = mac;

        // Remove ip-binding entries for this MAC
        const bindings = await router.writeCmd('/ip/hotspot/ip-binding/print', [`?mac-address=${mac}`]);
        for (const b of bindings || []) {
          await router.writeCmd('/ip/hotspot/ip-binding/remove', [`=.id=${b['.id']}`]);
        }

        // Remove hotspot user
        const users = await router.writeCmd('/ip/hotspot/user/print', [`?name=${username}`]);
        for (const u of users || []) {
          await router.writeCmd('/ip/hotspot/user/remove', [`=.id=${u['.id']}`]);
        }

        tx.routerProvisioned = false;
        tx.routerProvisionError = 'Cleaned up by retention job';
        await tx.save();
      } catch (innerErr) {
        console.error('Error cleaning transaction', tx._id, innerErr.message || innerErr);
      }
    }
  } finally {
    await router.disconnect();
  }
}

// Scheduler: run periodically if enabled
function startCleanupScheduler() {
  const enabled = String(process.env.ENABLE_BINDING_CLEANUP || 'false').toLowerCase() === 'true';
  if (!enabled) return;
  const intervalMin = Number(process.env.CLEANUP_INTERVAL_MIN || 60);
  // Run immediately, then schedule
  cleanupOldBindings().catch((e) => console.error('Cleanup job error:', e.message || e));
  setInterval(() => cleanupOldBindings().catch((e) => console.error('Cleanup job error:', e.message || e)), intervalMin * 60 * 1000);
}

module.exports = { cleanupOldBindings, startCleanupScheduler };
