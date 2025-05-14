import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { KeycloakProvider, KeycloakContext } from './contexts/KeycloakContext';
import Layout from './components/Layout';
import TestMicroFrontend from './components/TestMicroFrontend';
import DashboardContainer from './components/DashboardContainer';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import './App.css';

const Calculator = lazy(() => import('microfrontends/Calculator'));

// Home component
const Home = () => {
  const { authenticated, loading, login, keycloak } = React.useContext(KeycloakContext);

  const handleLogin = () => {
    login();
  };

  const handleSignup = () => {
    // Redirect to Keycloak registration page
    // Use login with action=register parameter which is more reliable than keycloak.register()
    keycloak.login({ action: 'register' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Initializing application...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="landing-container">
        <div className="landing-content">
          <h1>Welcome to Windsurf</h1>
          <p className="landing-description">Experience the power of micro frontends with seamless integration.</p>

          <div className="landing-features">
            <div className="landing-feature">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                  ></rect>
                  <line
                    x1="3"
                    y1="9"
                    x2="21"
                    y2="9"
                  ></line>
                  <line
                    x1="9"
                    y1="21"
                    x2="9"
                    y2="9"
                  ></line>
                  <line
                    x1="15"
                    y1="21"
                    x2="15"
                    y2="9"
                  ></line>
                </svg>
              </div>
              <h3>Interactive Dashboard</h3>
              <p>View real-time statistics and activity feeds</p>
            </div>

            <div className="landing-feature">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="2"
                    ry="2"
                  ></rect>
                  <line
                    x1="9"
                    y1="9"
                    x2="9.01"
                    y2="9"
                  ></line>
                  <line
                    x1="15"
                    y1="9"
                    x2="15.01"
                    y2="9"
                  ></line>
                  <line
                    x1="9"
                    y1="15"
                    x2="9.01"
                    y2="15"
                  ></line>
                  <line
                    x1="15"
                    y1="15"
                    x2="15.01"
                    y2="15"
                  ></line>
                </svg>
              </div>
              <h3>Advanced Calculator</h3>
              <p>Perform calculations with a modern interface</p>
            </div>

            <div className="landing-feature">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Secure Authentication</h3>
              <p>Enterprise-grade security with Keycloak</p>
            </div>
          </div>

          <div className="auth-buttons">
            <button
              className="login-button"
              onClick={handleLogin}
            >
              Log In
            </button>
            <button
              className="signup-button"
              onClick={handleSignup}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1>Welcome to Windsurf Main Application</h1>
      <p>This is the main application that integrates multiple micro frontends.</p>

      <div className="features-grid">
        <div className="feature-card">
          <h2>Dashboard</h2>
          <p>View statistics and recent activity in the Dashboard micro frontend.</p>
          <a
            href="/dashboard"
            className="feature-link"
          >
            Open Dashboard
          </a>
        </div>

        <div className="feature-card">
          <h2>Calculator</h2>
          <p>Perform calculations using the Calculator micro frontend.</p>
          <a
            href="/calculator"
            className="feature-link"
          >
            Open Calculator
          </a>
        </div>

        <div className="feature-card">
          <h2>Test Page</h2>
          <p>Test the micro frontend loading directly.</p>
          <a
            href="/test"
            className="feature-link"
          >
            Open Test Page
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <KeycloakProvider>
      <Router>
        <Layout>
          <Suspense
            fallback={
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading application...</p>
              </div>
            }
          >
            <Routes>
              <Route
                path="/"
                element={<Home />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardContainer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calculator"
                element={
                  <ProtectedRoute>
                    <Calculator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test"
                element={
                  <ProtectedRoute>
                    <TestMicroFrontend />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </KeycloakProvider>
  );
}

export default App;
