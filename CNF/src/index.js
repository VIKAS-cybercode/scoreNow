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
    domain="dev-uvf7oh8ayju2jtgz.us.auth0.com"
    clientId="4ycODGUtFWxVeD7UjNCumOWJX2PUpDS6"
    authorizationParams={{
      redirect_uri: window.location.origin,
      useRefreshTokens: true, 
    cacheLocation: "sessionstorage"
    }}>
    <App />
    </Auth0Provider>
  // </React.StrictMode>
);
