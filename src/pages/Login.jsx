import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeycloakContext } from '../contexts/KeycloakContext';
import './Login.css';

const Login = () => {
  const { login, authenticated, loading } = useContext(KeycloakContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // If already authenticated, redirect to the intended page
    if (authenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [authenticated, loading, navigate, from]);

  const handleLogin = () => {
    login();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Windsurf</h1>
        <p className="login-description">
          Access the dashboard and calculator micro frontends with a single login.
        </p>
        <button className="login-button" onClick={handleLogin}>
          Sign in with Keycloak
        </button>
        <div className="login-info">
          <p>This application uses Keycloak for secure authentication.</p>
          <p>You'll be redirected to the Keycloak login page.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
