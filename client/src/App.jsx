import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import Widget from './components/Widget.jsx';
import PlatformNodes from './components/PlatformNodes.jsx';
import BrowserRequestors from './components/BrowserRequestors.jsx';

const DEFAULT_LOGIN_URL = 'https://localhost:8443/prweb/';

export default function App() {
  const [loginUrl, setLoginUrl] = useState(DEFAULT_LOGIN_URL);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';

    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [isDarkMode]);

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
        <button
          className="icon-button theme-toggle"
          type="button"
          aria-label={isDarkMode ? 'Enable light mode' : 'Enable dark mode'}
          title={isDarkMode ? 'Enable light mode' : 'Enable dark mode'}
          onClick={() => setIsDarkMode((darkMode) => !darkMode)}
        >
          {isDarkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
      </header>

      <main className="widget-grid">
        <Widget title="Pega Platform" subtitle="Login screen">
          <p className="widget-text">
            Open the Pega Platform login screen of your local instance.
          </p>
          <a className="widget-link" href={loginUrl} target="_blank" rel="noreferrer">
            Go to Pega
          </a>
          {/* <span className="widget-hint">{loginUrl}</span> */}
        </Widget>
        <PlatformNodes />
        <BrowserRequestors />
      </main>
    </div>
  );
}
