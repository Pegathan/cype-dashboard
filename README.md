# Pega Dashboard

A React and Express dashboard for displaying nodes from a local Pega environment.

## Prerequisites

- Node.js and npm installed and available on your `PATH`.
- A running Pega environment and credentials that can access the configured API.

## Installation

From the project directory, install the dependencies with:

```bash
npm install
```

## Configuration

Edit `./config/default.json` and update the values under the `pega` object:

```json
{
  "pega": {
    "loginUrl": "https://localhost:8443/prweb/",
    "apiBaseUrl": "https://localhost:8443/prweb/api/v1",
    "username": "your-pega-username",
    "password": "your-pega-password",
    "allowSelfSignedCertificate": true,
    "requestTimeoutMs": 15000,
    "cacheTtlMs": 300000
  }
}
```

Configuration fields:

- `loginUrl`: URL opened when the user signs in to Pega.
- `apiBaseUrl`: Base URL for the Pega REST API used by the dashboard.
- `username`: Pega username used by the server for API requests.
- `password`: Password for the configured Pega username.
- `allowSelfSignedCertificate`: Set to `true` for local Pega environments that use a self-signed HTTPS certificate. Use `false` when the certificate is trusted.
- `requestTimeoutMs`: Maximum time, in milliseconds, to wait for a Pega API request. The default is `15000`.
- `cacheTtlMs`: How long, in milliseconds, node data is cached. The default is `300000` (5 minutes).

For local or shared development, you can create `./config/local.json` with the same structure. Its `pega` values override `default.json`, and `local.json` is intended to remain uncommitted:

```json
{
  "pega": {
    "username": "your-pega-username",
    "password": "your-pega-password"
  }
}
```

Environment variables take precedence over both JSON configuration files. Supported variables include:

```text
PORT
PEGA_LOGIN_URL
PEGA_API_BASE_URL
PEGA_API_USERNAME
PEGA_API_PASSWORD
PEGA_ALLOW_SELF_SIGNED_CERT
PEGA_REQUEST_TIMEOUT_MS
PEGA_CACHE_TTL_MS
```

Use environment variables for credentials in automated or shared environments so passwords are not stored in source-controlled files.

## Running the project

### Development

Start the API server in one terminal:

```bash
npm start
```

Then start the Vite development server in another terminal:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite server proxies `/api` requests to the backend at `http://localhost:3000`.

### Build and serve

To build the client and serve the compiled application through Express:

```bash
npm run serve
```

Open [http://localhost:3000](http://localhost:3000). The `serve` script runs the client build and then starts the server.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port `5173`. |
| `npm run build` | Build the client into `dist/`. |
| `npm start` | Start the Express server on port `3000` by default. |
| `npm run serve` | Build the client and start the Express server. |