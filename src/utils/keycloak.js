import Keycloak from 'keycloak-js';

// Initialize Keycloak instance
const keycloakConfig = {
  url: 'http://localhost:8080', // URL to your Keycloak server
  realm: 'windsurf', // Your realm name
  clientId: 'react-auth', // Your client ID
  'public-client': true, // Enable public client access
  'verify-token-audience': true // Verify token audience
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
