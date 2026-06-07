const RouterService = require('./router').RouterService || require('./router');
const RouterConfig = require('../models/RouterConfig');

async function provisionOnRouter(routerId, macAddress, duration) {
  const cfg = await RouterConfig.findById(routerId).lean().exec();
  if (!cfg) throw new Error('Router configuration not found');

  const r = new RouterService();
  r.setRouterConfig(cfg);
  return r.provisionUser(macAddress, duration);
}

module.exports = { provisionOnRouter };
