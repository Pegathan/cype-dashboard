const path = require('path');
const express = require('express');
const config = require('./config');
const nodesStore = require('./nodesStore');

const app = express();
const DIST_DIR = path.join(__dirname, '..', 'dist');

app.get('/api/config', (req, res) => {
  res.json({ pegaLoginUrl: config.pega.loginUrl });
});

app.get('/api/nodes', (req, res) => {
  nodesStore
    .getNodes({ forceRefresh: req.query.refresh === 'true' })
    .then((result) => res.json(result))
    .catch((error) => {
      console.error('Failed to retrieve Pega nodes:', error.message);
      res.status(502).json({ error: 'Unable to retrieve Pega nodes' });
    });
});

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(config.port, () => {
  console.log(`Pega dashboard available on http://localhost:${config.port}`);
});
