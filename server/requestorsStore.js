const pegaClient = require('./pegaClient');

function extractRequestors(payload, nodeId) {
  const results = payload?.data?.result || [];

  return results.flatMap((result) => result.requestors || [])
    .map((requestor) => ({
      nodeId,
      requestorType: requestor.requestor_type,
      requestorId: requestor.requestor_id,
      lastAccess: requestor.last_access,
      operatorId: requestor.operator_id
    }))
    .filter((requestor) => requestor.requestorType === 'BROWSER' && requestor.operatorId !== 'none');
}

function getNodeRequestors(nodeId) {
  return pegaClient
    .request(`/nodes/${encodeURIComponent(nodeId)}/requestors`)
    .then((payload) => extractRequestors(payload, nodeId));
}

function terminateRequestor(nodeId, requestorId) {
  return pegaClient
    .request(`/nodes/${encodeURIComponent(nodeId)}/requestors/${encodeURIComponent(requestorId)}`, { method: 'DELETE' })
    .then((payload) => payload?.data?.result?.[0] || null);
}

module.exports = { getNodeRequestors, terminateRequestor };
