import React from 'react';
import ReactDOM from 'react-dom/client';
import Container from './shared/componens/Container/Container.jsx';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './shared/styled/index.css';
import '@fontsource/open-sans';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Container>
        <App />
      </Container>
    </BrowserRouter>
  </React.StrictMode>
);
