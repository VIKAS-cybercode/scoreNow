import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Auth0Provider
    domain="dev-gvj3pkct5ugv7r3p.us.auth0.com"
    clientId="5OFmo805FUNSq8sHBrKIFEoq1P8ROM6p"
    authorizationParams={{
      redirect_uri: window.location.origin,
      useRefreshTokens: true, 
    cacheLocation: "sessionstorage"
    }}>
    <App />
    </Auth0Provider>
  // </React.StrictMode>
);
