const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');

function readJson(fileName) {
  const filePath = path.join(CONFIG_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// config/local.json is git-ignored and overrides config/default.json; env vars win over both.
const defaults = readJson('default.json');
const local = readJson('local.json');
const pega = { ...defaults.pega, ...local.pega };

const config = {
  port: toNumber(process.env.PORT, 3000),
  pega: {
    loginUrl: process.env.PEGA_LOGIN_URL || pega.loginUrl,
    oidcAuthUrl: process.env.PEGA_OIDC_AUTH_URL || pega.oidcAuthUrl,
    apiBaseUrl: process.env.PEGA_API_BASE_URL || pega.apiBaseUrl,
    username: process.env.PEGA_API_USERNAME || pega.username,
    password: process.env.PEGA_API_PASSWORD || pega.password,
    allowSelfSignedCertificate: toBoolean(
      process.env.PEGA_ALLOW_SELF_SIGNED_CERT,
      pega.allowSelfSignedCertificate !== false
    ),
    requestTimeoutMs: toNumber(process.env.PEGA_REQUEST_TIMEOUT_MS, pega.requestTimeoutMs || 15000)
  }
};

module.exports = config;
