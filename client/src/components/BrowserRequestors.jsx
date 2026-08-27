import { Fragment, useEffect, useState } from 'react';
import { Info, RefreshCw, X } from 'lucide-react';
import Widget from './Widget.jsx';

export default function BrowserRequestors() {
  const [requestors, setRequestors] = useState([]);
  const [status, setStatus] = useState('loading');
  const [selectedRequestor, setSelectedRequestor] = useState(null);

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
    const intervalId = setInterval(loadRequestors, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Fragment>
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
              <div className="requestor-row-header">
                <strong>{requestor.operatorId}</strong>
                <button
                  className="icon-button icon-button-small"
                  type="button"
                  aria-label="Show requestor details"
                  title="Show requestor details"
                  onClick={() => setSelectedRequestor(requestor)}
                >
                  <Info aria-hidden="true" size={14} />
                </button>
              </div>
              <span className="node-id">{requestor.lastAccess || 'Unknown operator'}</span>
            </li>
          ))}
        </ul>
      )}
    </Widget>
    {selectedRequestor && (
      <div className="overlay-backdrop" role="presentation" onClick={() => setSelectedRequestor(null)}>
        <div
          className="overlay-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Requestor details"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="overlay-header">
            <h3>Requestor details</h3>
            <button
              className="icon-button"
              type="button"
              aria-label="Close requestor details"
              title="Close requestor details"
              onClick={() => setSelectedRequestor(null)}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <dl className="overlay-details">
            {Object.entries(selectedRequestor).map(([key, value]) => (
              <div className="overlay-details-row" key={key}>
                <dt>{key}</dt>
                <dd>{value === null || value === undefined || value === '' ? '—' : String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )}
    </Fragment>
  );
}
