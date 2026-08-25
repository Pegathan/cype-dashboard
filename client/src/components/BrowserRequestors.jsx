import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Widget from './Widget.jsx';

export default function BrowserRequestors() {
  const [requestors, setRequestors] = useState([]);
  const [status, setStatus] = useState('loading');

  function loadRequestors() {
    setStatus('loading');
    fetch('/api/nodes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to retrieve platform nodes');
        }
        return response.json();
      })
      .then((result) => Promise.all(
        (result.nodeIds || []).map((nodeId) =>
          fetch(`/api/nodes/${encodeURIComponent(nodeId)}/requestors`).then((response) => {
            if (!response.ok) {
              throw new Error('Unable to retrieve node requestors');
            }
            return response.json();
          })
        )
      ))
      .then((results) => {
        setRequestors(results.flatMap((result) => result.requestors || []));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(() => {
    loadRequestors();
  }, []);

  return (
    <Widget
      title="Browser Requestors"
      subtitle="Active across platform nodes"
      actions={
        <button
          className="icon-button"
          type="button"
          aria-label="Refresh browser requestors"
          title="Refresh browser requestors"
          onClick={loadRequestors}
          disabled={status === 'loading'}
        >
          <RefreshCw aria-hidden="true" size={18} />
        </button>
      }
    >
      {status === 'loading' && <p className="widget-text">Loading browser requestors...</p>}
      {status === 'error' && <p className="widget-text">Browser requestor status is unavailable.</p>}
      {status === 'ready' && requestors.length === 0 && (
        <p className="widget-text">No browser requestors were returned.</p>
      )}
      {status === 'ready' && requestors.length > 0 && (
        <ul className={`requestor-list${requestors.length > 5 ? ' requestor-list-scrollable' : ''}`}>
          {requestors.map((requestor) => (
            <li className="requestor-row" key={requestor.requestorId}>
              <strong>{requestor.operatorId}</strong>
              <span className="node-id">{requestor.lastAccess || 'Unknown operator'}</span>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}
