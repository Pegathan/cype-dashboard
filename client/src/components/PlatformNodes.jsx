import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Widget from './Widget.jsx';

function statusClassName(status) {
  return status?.toLowerCase() === 'running' ? 'status-running' : 'status-stopped';
}

export default function PlatformNodes() {
  const [nodes, setNodes] = useState([]);
  const [status, setStatus] = useState('loading');

  function loadNodes(forceRefresh = false) {
    setStatus('loading');
    fetch(forceRefresh ? '/api/nodes?refresh=true' : '/api/nodes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to retrieve platform nodes');
        }
        return response.json();
      })
      .then((result) => {
        setNodes(result.nodes || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(() => {
    loadNodes();
  }, []);

  return (
    <Widget
      title="Platform nodes"
      subtitle="Cluster members"
      actions={
        <button
          className="icon-button"
          type="button"
          aria-label="Refresh platform nodes"
          title="Refresh platform nodes"
          onClick={() => loadNodes(true)}
          disabled={status === 'loading'}
        >
          <RefreshCw aria-hidden="true" size={18} />
        </button>
      }
    >
      {status === 'loading' && <p className="widget-text">Loading platform nodes...</p>}
      {status === 'error' && <p className="widget-text">Platform node status is unavailable.</p>}
      {status === 'ready' && nodes.length === 0 && (
        <p className="widget-text">No platform nodes were returned.</p>
      )}
      {status === 'ready' && nodes.length > 0 && (
        <ul className="node-list">
          {nodes.map((node) => (
            <li className="node-row" key={node.nodeId}>
              <div>
                <strong>{node.hostName || node.nodeId}</strong>
                <span className="node-id">{node.nodeId}</span>
              </div>
              <span className={`node-status ${statusClassName(node.runningState)}`}>
                {node.runningState || 'Unknown'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}