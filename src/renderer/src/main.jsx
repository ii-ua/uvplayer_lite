import React from 'react';
import ReactDOM from 'react-dom/client';
import Container from './shared/componens/Container/Container.jsx';
import App from './App';
import './shared/styled/index.css';
import '@fontsource/open-sans';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://7a655273ab05804053ea0459f6bb808b@o4506161259544576.ingest.sentry.io/4506161263083520',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Container>
      <App />
    </Container>
  </React.StrictMode>
);
