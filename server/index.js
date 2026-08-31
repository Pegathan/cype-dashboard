const path = require('path');
const express = require('express');
const config = require('./config');
const nodesStore = require('./nodesStore');
const requestorsStore = require('./requestorsStore');

const app = express();
const DIST_DIR = path.join(__dirname, '..', 'dist');

app.get('/api/config', (req, res) => {
  res.json({
    pegaLoginUrl: config.pega.loginUrl,
    pegaOidcAuthUrl: config.pega.oidcAuthUrl
  });
});

app.get('/api/nodes', (req, res) => {
  nodesStore
    .getNodes()
    .then((result) => res.json(result))
    .catch((error) => {
      console.error('Failed to retrieve Pega nodes:', error.message);
      res.status(502).json({ error: 'Unable to retrieve Pega nodes' });
    });
});

app.get('/api/nodes/:nodeId/requestors', (req, res) => {
  requestorsStore
    .getNodeRequestors(req.params.nodeId)
    .then((requestors) => res.json({ requestors }))
    .catch((error) => {
      console.error(`Failed to retrieve requestors for node ${req.params.nodeId}:`, error.message);
      res.status(502).json({ error: 'Unable to retrieve node requestors' });
    });
});

app.delete('/api/nodes/:nodeId/requestors/:requestorId', (req, res) => {
  requestorsStore
    .terminateRequestor(req.params.nodeId, req.params.requestorId)
    .then((result) => res.json({ result }))
    .catch((error) => {
      console.error(`Failed to terminate requestor ${req.params.requestorId} on node ${req.params.nodeId}:`, error.message);
      res.status(502).json({ error: 'Unable to terminate requestor' });
    });
});

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(config.port, () => {
  console.log(`Pega dashboard available on http://localhost:${config.port}`);
});
