const pegaClient = require('./pegaClient');

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

function getNodes() {
  return pegaClient.request('/nodes').then((payload) => {
    const nodes = extractNodes(payload);
    return { nodes, nodeIds: nodes.map((node) => node.nodeId) };
  });
}

function getNodeIds() {
  return getNodes().then((result) => result.nodeIds);
}

module.exports = { getNodes, getNodeIds };
