import axios from 'axios';
import keycloak from './keycloak';

/**
 * Create an Axios instance with default configuration
 */
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Base URL for all API calls
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Get the current Keycloak access token if available
 * @returns {string|null} The access token or null if not available
 */
const getAccessToken = async () => {
  try {
    // Check if keycloak is initialized and has a token
    if (keycloak && keycloak.authenticated) {
      // Check if token needs to be refreshed
      const tokenExpired = keycloak.isTokenExpired();
      if (tokenExpired) {
        try {
          await keycloak.updateToken(5);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw refreshError;
        }
      }
      return keycloak.token;
    }
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

/**
 * Add a request interceptor to include the Keycloak token in all requests
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Create a new CancelToken source for this request
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      
      // Store the cancel function
      const requestId = Math.random().toString(36).substring(7);
      config._requestId = requestId;
      config._cancel = source.cancel;

      // Try to get the access token
      const token = await getAccessToken();
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else if (!keycloak.authenticated) {
        // Cancel the request if not authenticated
        source.cancel('User not authenticated');
        throw new Error('Authentication required');
      }
      
      return config;
    } catch (error) {
      console.error('Request setup error:', error);
      throw error;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Add a response interceptor to handle errors
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response.data;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      
      // Handle 401 Unauthorized by redirecting to login
      if (error.response.status === 401) {
        console.error('Authentication token rejected by server');
        if (keycloak) {
          keycloak.login();
        }
      }
    } else if (error.request) {
      console.error('No response received from server', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API utility for making authenticated requests to the backend
 * This utility automatically includes the Keycloak access token in all requests
 */
const api = {
  /**
   * Make a GET request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Additional axios options
   * @returns {Promise<any>} - The response data
   */
  async get(endpoint, options = {}) {
    try {
      return await axiosInstance.get(endpoint, {
        ...options,
        retry: 1, // Allow one retry
        retryDelay: 1000 // Wait 1 second before retry
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      }
      throw error;
    }
  },

  /**
   * Make a POST request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional axios options
   * @returns {Promise<any>} - The response data
   */
  async post(endpoint, data, options = {}) {
    return axiosInstance.post(endpoint, data, options);
  },

  /**
   * Make a PUT request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional axios options
   * @returns {Promise<any>} - The response data
   */
  async put(endpoint, data, options = {}) {
    return axiosInstance.put(endpoint, data, options);
  },

  /**
   * Make a DELETE request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Additional axios options
   * @returns {Promise<any>} - The response data
   */
  async delete(endpoint, options = {}) {
    return axiosInstance.delete(endpoint, options);
  }
};

export default api;
