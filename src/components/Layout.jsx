import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeycloakContext } from '../contexts/KeycloakContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { authenticated, user, logout } = useContext(KeycloakContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  // Determine if we should show the full header with navigation
  const isLandingPage = !authenticated && window.location.pathname === '/';

  return (
    <div className="layout">
      {!isLandingPage ? (
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <Link to="/">Windsurf</Link>
            </div>
            {authenticated && (
              <nav className="nav">
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/calculator">Calculator</Link>
                  </li>
                </ul>
              </nav>
            )}
            <div className="user-menu">
              {authenticated ? (
                <div className="user-info">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className="login-button"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>
      ) : null}
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Windsurf - Micro Frontend Demo</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
