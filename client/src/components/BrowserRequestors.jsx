import { Fragment, useEffect, useState } from 'react';
import { Info, RefreshCw, X } from 'lucide-react';
import Widget from './Widget.jsx';

export default function BrowserRequestors() {
  const [requestors, setRequestors] = useState([]);
  const [status, setStatus] = useState('loading');
  const [selectedRequestor, setSelectedRequestor] = useState(null);
  const [terminatingRequestor, setTerminatingRequestor] = useState(null);
  const [terminateStatus, setTerminateStatus] = useState('idle');

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

  function openTerminateConfirmation(requestor) {
    setTerminatingRequestor(requestor);
    setTerminateStatus('idle');
  }

  function closeTerminateConfirmation() {
    setTerminatingRequestor(null);
    setTerminateStatus('idle');
  }

  function confirmTermination() {
    setTerminateStatus('pending');
    fetch(`/api/nodes/${encodeURIComponent(terminatingRequestor.nodeId)}/requestors/${encodeURIComponent(terminatingRequestor.requestorId)}`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to terminate requestor');
        }
        return response.json();
      })
      .then(() => {
        setRequestors((current) =>
          current.filter((requestor) => requestor.requestorId !== terminatingRequestor.requestorId)
        );
        setTerminatingRequestor(null);
        setTerminateStatus('idle');
      })
      .catch(() => setTerminateStatus('error'));
  }

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
              <div className="requestor-row-main">
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
              </div>
              <button
                className="icon-button icon-button-small icon-button-danger"
                type="button"
                aria-label="Terminate requestor"
                title="Terminate requestor"
                onClick={() => openTerminateConfirmation(requestor)}
              >
                <X aria-hidden="true" size={14} />
              </button>
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
    {terminatingRequestor && (
      <div className="overlay-backdrop" role="presentation" onClick={closeTerminateConfirmation}>
        <div
          className="overlay-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Terminate requestor"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="overlay-header">
            <h3>Terminate requestor</h3>
            <button
              className="icon-button"
              type="button"
              aria-label="Close terminate requestor confirmation"
              title="Close terminate requestor confirmation"
              onClick={closeTerminateConfirmation}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <p className="overlay-text">
            Are you sure you want to terminate the requestor for{' '}
            <strong>{terminatingRequestor.operatorId}</strong>?
          </p>
          {terminateStatus === 'error' && (
            <p className="overlay-error">Unable to terminate this requestor. Please try again.</p>
          )}
          <div className="overlay-actions">
            <button className="button" type="button" onClick={closeTerminateConfirmation}>
              Cancel
            </button>
            <button
              className="button button-danger"
              type="button"
              onClick={confirmTermination}
              disabled={terminateStatus === 'pending'}
            >
              Terminate
            </button>
          </div>
        </div>
      </div>
    )}
    </Fragment>
  );
}
