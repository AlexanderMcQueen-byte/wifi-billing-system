const axios = require('axios');

class CloudflareStore {
  constructor({ accountId, kvNamespaceId, apiToken }) {
    if (!accountId || !kvNamespaceId || !apiToken) {
      throw new Error('CloudflareStore requires accountId, kvNamespaceId, and apiToken');
    }

    this.accountId = accountId;
    this.kvNamespaceId = kvNamespaceId;
    this.apiToken = apiToken;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/storage/kv/namespaces/${encodeURIComponent(kvNamespaceId)}/values`;
    this.headers = {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'text/plain;charset=UTF-8'
    };
  }

  async get(key) {
    try {
      const url = `${this.baseUrl}/${encodeURIComponent(key)}`;
      const response = await axios.get(url, { headers: this.headers, timeout: 5000, responseType: 'text' });
      if (response.status === 200) {
        return response.data ? JSON.parse(response.data) : null;
      }
      return null;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async set(key, value, ttlSeconds = 0) {
    const url = `${this.baseUrl}/${encodeURIComponent(key)}`;
    const params = new URLSearchParams();
    if (ttlSeconds > 0) {
      params.append('expiration_ttl', String(ttlSeconds));
    }

    await axios.put(`${url}?${params.toString()}`, JSON.stringify(value), {
      headers: this.headers,
      timeout: 5000
    });
  }

  async del(key) {
    const url = `${this.baseUrl}/${encodeURIComponent(key)}`;
    await axios.delete(url, { headers: this.headers, timeout: 5000 });
  }
}

module.exports = CloudflareStore;
