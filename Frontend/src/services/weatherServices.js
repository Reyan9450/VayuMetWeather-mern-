import axios from 'axios';

// This MUST be the full, absolute URL of your backend on Render
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://vayumet-weather-server.onrender.com'
  : '';

/**
 * Fetches METAR data for a specific bounding box
 * @param {string} bbox - The bounding box string "north,west,south,east"
 */
export const fetchMetars = async (bbox) => {
    if (!bbox) return []; 
    try {
        // The request now uses the full URL
        const response = await axios.get(`${API_BASE_URL}/api/metars/mapdata?bbox=${bbox}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching METAR data:", error);
        return [];
    }
};

/**
 * Fetches TAF data for a specific bounding box
 * @param {string} bbox - The bounding box string "north,west,south,east"
 */
export const fetchTafs = async (bbox) => {
    if (!bbox) return []; 
    try {
        // The request now uses the full URL
        const response = await axios.get(`${API_BASE_URL}/api/tafs/mapdata?bbox=${bbox}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching TAF data:", error);
        return [];
    }
};