const pegaClient = require('./pegaClient');
const config = require('./config');

const cache = {
  nodes: [],
  fetchedAt: 0,
  pending: null
};

function extractNodes(payload) {
  // /nodes answers with { data: { result: [ { cluster_members: [...] } ] } }
  const results = payload?.data?.result || [];
  const rawNodes = results.flatMap((result) => result.cluster_members || []);

  return rawNodes
    .filter((node) => Boolean(node.nodeId))
    .map((node) => ({
      nodeId: node.nodeId,
      hostName: node.host_name,
      nodeType: node.node_type,
      runningState: node.running_state,
      startTime: node.starttime,
      lastHeartbeat: node.last_heartbeat,
      metrics: node.metrics
    }));
}

function isFresh() {
  return cache.fetchedAt > 0 && Date.now() - cache.fetchedAt < config.pega.cacheTtlMs;
}

/**
 * Returns the Pega node list, served from cache unless it expired or a refresh is forced.
 */
function getNodes({ forceRefresh = false } = {}) {
  if (!forceRefresh && isFresh()) {
    return Promise.resolve(snapshot());
  }
  if (cache.pending) {
    return cache.pending;
  }

  cache.pending = pegaClient
    .request('/nodes')
    .then((payload) => {
      cache.nodes = extractNodes(payload);
      cache.fetchedAt = Date.now();
      return snapshot();
    })
    .finally(() => {
      cache.pending = null;
    });

  return cache.pending;
}

function getNodeIds(options) {
  return getNodes(options).then((result) => result.nodes.map((node) => node.nodeId));
}

function snapshot() {
  return {
    nodes: cache.nodes,
    nodeIds: cache.nodes.map((node) => node.nodeId),
    fetchedAt: new Date(cache.fetchedAt).toISOString(),
    cached: isFresh()
  };
}

function clear() {
  cache.nodes = [];
  cache.fetchedAt = 0;
}

module.exports = { getNodes, getNodeIds, clear };
