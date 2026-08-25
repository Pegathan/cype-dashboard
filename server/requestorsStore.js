const pegaClient = require('./pegaClient');

function extractRequestors(payload) {
  const results = payload?.data?.result || [];

  return results.flatMap((result) => result.requestors || [])
    .map((requestor) => ({
      requestorType: requestor.requestor_type,
      requestorId: requestor.requestor_id,
      lastAccess: requestor.last_access,
      operatorId: requestor.operator_id
    }))
    .filter((requestor) => requestor.requestorType === 'BROWSER');
}

function getNodeRequestors(nodeId) {
  return pegaClient
    .request(`/nodes/${encodeURIComponent(nodeId)}/requestors`)
    .then(extractRequestors);
}

module.exports = { getNodeRequestors };
