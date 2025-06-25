import axios from 'axios';
import { Platform } from 'react-native';

// Use environment-aware API URL
const API_BASE_URL = Platform.OS === 'web' 
  ? 'https://ecoquestai-backend.vercel.app/api'  // Your deployed backend URL
  : 'http://10.0.0.235:3000/api';  // Local development

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Creates a new demo user for testing purposes.
 * @returns {Promise<any>} The created user object.
 */
export const createDemoUser = () => {
  return api.post('/users/demo');
};

/**
 * Fetches the complete profile for a given user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<any>} The user's profile data.
 */
export const getUserProfile = (userId: string) => {
  return api.get(`/users/${userId}/profile`);
};

/**
 * Creates a new hunt for a user.
 * @param {object} huntData - The data for the new hunt.
 * @param {string} huntData.theme - The theme of the hunt.
 * @param {object} huntData.location - The user's location.
 * @param {string} huntData.userId - The ID of the user.
 * @returns {Promise<any>} The newly created hunt object.
 */
export const createHunt = (huntData: {
  theme: string;
  location: {lat: number; lng: number};
  userId: string;
}) => {
  return api.post('/hunts', huntData);
};

/**
 * Fetches the active hunt for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<any>} The active hunt object.
 */
export const getActiveHunt = (userId: string) => {
  return api.get(`/hunts/active/${userId}`);
};

/**
 * Completes a stop in a hunt.
 * @param {object} params - The parameters for completing a stop.
 * @param {number} params.huntId - The ID of the hunt.
 * @param {string} params.stopId - The ID of the stop.
 * @param {object} [params.body] - The request body (e.g., for trivia answers).
 * @returns {Promise<any>} The result of the completion.
 */
export const completeStop = (params: {
  huntId: number;
  stopId: string;
  body?: any;
}) => {
  return api.post(
    `/hunts/${params.huntId}/stops/${params.stopId}/complete`,
    params.body,
  );
};

/**
 * Fetches all hunts for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<any>} The user's hunts.
 */
export const getUserHunts = (userId: string) => {
  return api.get(`/hunts/user/${userId}`);
};

/**
 * Fetches a hunt by its ID.
 * @param {number|string} huntId - The ID of the hunt.
 * @returns {Promise<any>} The hunt object.
 */
export const getHuntById = (huntId: number | string) => {
  return api.get(`/hunts/${huntId}`);
};

/**
 * Fetches points of interest (POIs) for the explore screen.
 * @returns {Promise<any>} Array of POI objects.
 */
export const getPOIs = () => {
  return api.get('/pois');
};

export default api; 