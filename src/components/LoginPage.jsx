import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeycloakContext } from '../contexts/KeycloakContext';
import '../App.css';

const LoginPage = () => {
  const { login } = useContext(KeycloakContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the message from state if available
  const message = location.state?.message || 'Please log in to access this page';
  
  // Function to handle login button click
  const handleLogin = () => {
    // Store the current path for redirect after login
    const redirectPath = location.state?.from || '/';
    sessionStorage.setItem('redirectUri', redirectPath);
    login();
  };
  
  // Function to go back to home
  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2>Authentication Required</h2>
        <p>{message}</p>
        <div className="login-buttons">
          <button className="primary-button" onClick={handleLogin}>
            Log In
          </button>
          <button className="secondary-button" onClick={goToHome}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
