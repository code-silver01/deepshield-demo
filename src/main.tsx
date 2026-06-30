import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { ThreatProvider } from './contexts/ThreatContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <ThreatProvider>
          <App />
        </ThreatProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
