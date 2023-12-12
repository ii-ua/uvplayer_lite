import React from 'react';
import ReactDOM from 'react-dom/client';
import Container from './shared/componens/Container/Container.jsx';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './shared/styled/index.css';
import '@fontsource/open-sans';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Container>
        <App />
      </Container>
    </HashRouter>
  </React.StrictMode>
);
