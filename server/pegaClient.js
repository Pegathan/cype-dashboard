const https = require('https');
const http = require('http');
const { URL } = require('url');
const config = require('./config');

const { apiBaseUrl, username, password, allowSelfSignedCertificate, requestTimeoutMs } = config.pega;

function authorizationHeader() {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

/**
 * Calls a Pega REST API resource (path relative to the configured API base URL).
 */
function request(resourcePath) {
  const url = new URL(apiBaseUrl.replace(/\/$/, '') + resourcePath);
  const client = url.protocol === 'https:' ? https : http;

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorizationHeader()
    },
    timeout: requestTimeoutMs
  };

  // The local Pega instance uses a self-signed certificate, hence the opt-out flag.
  if (url.protocol === 'https:') {
    options.rejectUnauthorized = !allowSelfSignedCertificate;
  }

  return new Promise((resolve, reject) => {
    const req = client.request(url, options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Pega API ${resourcePath} returned HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (error) {
          reject(new Error(`Pega API ${resourcePath} returned an invalid JSON payload`));
        }
      });
    });

    req.on('timeout', () => req.destroy(new Error(`Pega API ${resourcePath} timed out`)));
    req.on('error', reject);
    req.end();
  });
}

module.exports = { request };
