import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeycloakContext } from '../contexts/KeycloakContext';

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading, login } = useContext(KeycloakContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Set ready state when authentication check is complete
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  if (!isReady) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  if (!authenticated) {
    // Store the current location to redirect back after login
    sessionStorage.setItem('redirectUri', location.pathname + location.search);
    
    return (
      <div className="auth-required-container">
        <div className="auth-required-box">
          <h2>Authentication Required</h2>
          <p>You need to log in to access this page.</p>
          <div className="auth-required-buttons">
            <button className="primary-button" onClick={login}>Log In</button>
            <button className="secondary-button" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
