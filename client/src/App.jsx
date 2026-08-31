import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import Widget from './components/Widget.jsx';
import PlatformNodes from './components/PlatformNodes.jsx';
import BrowserRequestors from './components/BrowserRequestors.jsx';
import pegaLogo from './images/pega-logo.svg';
import pegaLogoDark from './images/pega-logo-dark.svg';

const DEFAULT_LOGIN_URL = 'https://localhost:8443/prweb/';
const DEFAULT_OIDC_AUTH_URL = 'https://localhost:8443/prweb/PRAuth/GoogleOIDC';

export default function App() {
  const [loginUrl, setLoginUrl] = useState(DEFAULT_LOGIN_URL);
  const [oidcAuthUrl, setOidcAuthUrl] = useState(DEFAULT_OIDC_AUTH_URL);
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
        if (config?.pegaOidcAuthUrl) {
          setOidcAuthUrl(config.pegaOidcAuthUrl);
        }
      })
      .catch(() => {
        setLoginUrl(DEFAULT_LOGIN_URL);
        setOidcAuthUrl(DEFAULT_OIDC_AUTH_URL);
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <img className="app-header-logo" src={isDarkMode ? pegaLogoDark : pegaLogo} alt="Pega" />
        <div className="app-header-title">
          <h1>CYPE</h1>
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
          <div className="widget-links">
            <a className="widget-link" href={loginUrl} target="_blank" rel="noreferrer">
              Basic Auth
            </a>
            <a className="widget-link" href={oidcAuthUrl} target="_blank" rel="noreferrer">
              OIDC Auth
            </a>
          </div>
          {/* <span className="widget-hint">{loginUrl}</span> */}
        </Widget>
        <PlatformNodes />
        <BrowserRequestors />
        <Widget className="widget-wide" title="Pega Web Embed" subtitle="Create test case">
          <pega-embed
            id="theEmbed"
            action="createCase"
            caseTypeID="OI6XDR-TestC11n-Work-TestCase"
            themeID="pzOrionDark"
            casePage="assignment"
            appAlias="test-c11n"
            pegaServerUrl="https://localhost:8443/prweb/"
            autoReauth="true"
            authService="GoogleOIDC"
            clientId="33762268495920866771"
          />
        </Widget>
      </main>
    </div>
  );
}
