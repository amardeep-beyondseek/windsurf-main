import React, { createContext, useState, useEffect } from 'react';
import keycloak from '../utils/keycloak';

// Create context
export const KeycloakContext = createContext(null);

export const KeycloakProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        // Check if keycloak is already initialized to prevent multiple initialization
        if (keycloak.authenticated !== undefined) {
          console.log('Keycloak already initialized, using existing instance');
          setInitialized(true);
          setAuthenticated(keycloak.authenticated);
          setLoading(false);

          if (keycloak.authenticated && keycloak.tokenParsed) {
            setUser({
              id: keycloak.subject,
              username: keycloak.tokenParsed.preferred_username,
              email: keycloak.tokenParsed.email,
              name: keycloak.tokenParsed.name,
              roles: keycloak.tokenParsed.realm_access?.roles || []
            });
          }
          return;
        }

        console.log('Initializing Keycloak...');
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          checkLoginIframe: false,
          enableLogging: true,
          token: sessionStorage.getItem('kc_token'),
          refreshToken: sessionStorage.getItem('kc_refreshToken'),
          idToken: sessionStorage.getItem('kc_idToken')
        });

        // Store tokens in sessionStorage for persistence
        if (auth && keycloak.token) {
          sessionStorage.setItem('kc_token', keycloak.token);
          sessionStorage.setItem('kc_refreshToken', keycloak.refreshToken);
          sessionStorage.setItem('kc_idToken', keycloak.idToken);
        }

        setInitialized(true);
        setAuthenticated(auth);
        setLoading(false);

        if (auth) {
          // Handle redirect after authentication
          const redirectUri = sessionStorage.getItem('redirectUri');
          if (redirectUri && !window.location.href.includes('auth/realms')) {
            sessionStorage.removeItem('redirectUri');
            // Use navigate instead of window.location to prevent full page reload
            const cleanRedirectUri = redirectUri.replace(window.location.origin, '');
            if (window.location.pathname !== cleanRedirectUri) {
              window.history.replaceState(null, '', cleanRedirectUri);
            }
          }

          // Set user info
          if (keycloak.tokenParsed) {
            setUser({
              id: keycloak.subject,
              username: keycloak.tokenParsed.preferred_username,
              email: keycloak.tokenParsed.email,
              name: keycloak.tokenParsed.name,
              roles: keycloak.tokenParsed.realm_access?.roles || []
            });
          }

          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log('Token expired, attempting refresh...');
            keycloak.updateToken(70).then(refreshed => {
              if (refreshed) {
                console.log('Token was successfully refreshed');
                sessionStorage.setItem('kc_token', keycloak.token);
                sessionStorage.setItem('kc_refreshToken', keycloak.refreshToken);
                sessionStorage.setItem('kc_idToken', keycloak.idToken);
              } else {
                console.log('Token is still valid');
              }
            }).catch(err => {
              console.error('Failed to refresh token', err);
              // Store current location before logout
              sessionStorage.setItem('redirectUri', window.location.pathname + window.location.search);
              // Clear stored tokens
              sessionStorage.removeItem('kc_token');
              sessionStorage.removeItem('kc_refreshToken');
              sessionStorage.removeItem('kc_idToken');
              keycloak.logout();
            });
          };
        }
      } catch (err) {
        setError('Failed to initialize Keycloak');
        setLoading(false);
        console.error('Keycloak init error', err);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    // Store current location to redirect back after login
    const currentPath = window.location.pathname + window.location.search;
    if (!currentPath.includes('auth/realms')) {
      sessionStorage.setItem('redirectUri', currentPath);
    }

    // Redirect to Keycloak login
    keycloak.login();
  };

  const logout = () => {
    // Clear all Keycloak-related storage
    sessionStorage.removeItem('redirectUri');
    sessionStorage.removeItem('kc_token');
    sessionStorage.removeItem('kc_refreshToken');
    sessionStorage.removeItem('kc_idToken');

    // Redirect to home page after logout
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const updateToken = minValidity => {
    return keycloak.updateToken(minValidity);
  };

  const hasRole = roles => {
    return roles.some(role => keycloak.hasRealmRole(role));
  };

  const isLoggedIn = () => {
    return !!keycloak.token;
  };

  const contextValue = {
    keycloak,
    initialized,
    authenticated,
    user,
    loading,
    error,
    login,
    logout,
    updateToken,
    hasRole
  };

  return <KeycloakContext.Provider value={contextValue}>{children}</KeycloakContext.Provider>;
};

export default KeycloakContext;
