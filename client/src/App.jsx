import { useEffect, useState } from 'react';
import Widget from './components/Widget.jsx';
import PlatformNodes from './components/PlatformNodes.jsx';

const DEFAULT_LOGIN_URL = 'https://localhost:8443/prweb/';

export default function App() {
  const [loginUrl, setLoginUrl] = useState(DEFAULT_LOGIN_URL);

  useEffect(() => {
    fetch('/api/config')
      .then((response) => (response.ok ? response.json() : null))
      .then((config) => {
        if (config?.pegaLoginUrl) {
          setLoginUrl(config.pegaLoginUrl);
        }
      })
      .catch(() => setLoginUrl(DEFAULT_LOGIN_URL));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Pega 26.1</h1>
          <p>Local environment dashboard</p>
        </div>
      </header>

      <main className="widget-grid">
        <Widget title="Pega Platform" subtitle="Login screen">
          <p className="widget-text">
            Open the Pega Platform login screen of your local instance.
          </p>
          <a className="widget-link" href={loginUrl} target="_blank" rel="noreferrer">
            Go to Pega
          </a>
          <span className="widget-hint">{loginUrl}</span>
        </Widget>
        <PlatformNodes />
      </main>
    </div>
  );
}
