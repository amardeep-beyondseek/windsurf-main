import React, { useState, useEffect, lazy, Suspense, useRef, useContext } from 'react';
import './DashboardContainer.css';
import api from '../utils/api';
import { KeycloakContext } from '../contexts/KeycloakContext';

// Lazy load the Dashboard micro frontend
const Dashboard = lazy(() => import('microfrontends/Dashboard'));

const DashboardContainer = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get Keycloak context
  const { authenticated, keycloak } = useContext(KeycloakContext);

  // Use a ref to track if a request is in progress to prevent duplicate calls
  const requestInProgress = useRef(false);
  // Track if the component is mounted
  const isMounted = useRef(true);

  // Initialize the mounted ref
  useEffect(() => {
    console.log('Component mounted, setting isMounted to true');
    isMounted.current = true;

    return () => {
      console.log('Component unmounting, setting isMounted to false');
      isMounted.current = false;
    };
  }, []);

  // Effect for fetching dashboard data
  useEffect(() => {
    let isActive = true;
    let currentRequest = null;
    let retryCount = 0;
    const maxRetries = 2;

    const fetchData = async () => {
      // Don't fetch if already have data or not authenticated
      if (!authenticated || !keycloak?.token) {
        setLoading(false);
        return;
      }

      // Cancel previous request if it exists
      if (currentRequest) {
        currentRequest.cancel('New request started');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/dashboard', {
          _customHandler: (cancelFn) => {
            currentRequest = { cancel: cancelFn };
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!isActive) return;

        if (response && response.stats && response.recentActivity && response.chartData) {
          setDashboardData(response);
          retryCount = 0; // Reset retry count on success
        } else {
          throw new Error('Invalid data structure received');
        }
      } catch (err) {
        if (!isActive) return;
        if (axios.isCancel(err)) {
          console.log('Request cancelled:', err.message);
          return;
        }

        // Retry logic
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying request (${retryCount}/${maxRetries})...`);
          setTimeout(fetchData, 1000 * retryCount); // Exponential backoff
          return;
        }

        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
      if (currentRequest) {
        currentRequest.cancel('Component unmounted');
      }
    };
  }, [authenticated, keycloak]); // Re-run when authentication state changes

  // Show loading state while fetching data
  if (loading && !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Display error message if there is one */}
      {error && (
        <div className="dashboard-error-banner">
          <p>{error}</p>
        </div>
      )}

      {/* Pass the data from the API to the Dashboard micro frontend as props */}
      <Suspense
        fallback={
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading Dashboard component...</p>
          </div>
        }
      >
        <Dashboard
          dashboardData={dashboardData}
          loading={loading}
          error={error}
          isContainer={true} // Flag to indicate this is the container component
        />
      </Suspense>
    </div>
  );
};

export default DashboardContainer;
