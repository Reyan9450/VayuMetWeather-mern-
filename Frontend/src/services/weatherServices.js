import axios from 'axios';
import { forecastElements, particulateMatter } from '../config/layer.js';
// This logic automatically selects the correct URL for dev vs. production
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://vayumet-weather-server.onrender.com'
  : 'http://localhost:5000';

// We only need the functions that fetch ALL data
export const fetchAllMetars = async () => {
    try {
        // const response = await axios.get(`${API_BASE_URL}/api/metars`);
        const response = await axios.get(`${API_BASE_URL}/api/metars`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ALL METARs:", error);
        return [];
    }
};

export const fetchAllTafs = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/tafs`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ALL TAFs:", error);
        return [];
    }
};

export const fetchAllSigmets = async () => {
    try {
        const response = await axios.get(`http://localhost:5000/api/sigmets`);
        console.log("Fetched SIGMET list:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching SIGMET list:", error);
        return [];
    }
};

// Fetch the bounds and settings
export const fetchForecastMetadata = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/forecast/metadata`);
        return response.data;
    } catch (error) {
        console.error("Error fetching forecast metadata:", error);
        return null;
    }
};

/**
 * Generates the URL for a specific forecast image.
 * @param {string} layerId - The ID of the layer (e.g., 'rain', 'icing', 'pm2_5').
 * @param {number} index - The time index (0, 1, 2...).
 * @returns {string} - The full URL to the image on the backend.
 */
export const getForecastImageUrl = (layerId, index) => {
    // 1. Combine lists to find the matching configuration
    const allLayers = [...forecastElements, ...particulateMatter];
    const layerConfig = allLayers.find(l => l.id === layerId);

    // Safety check: if the layer isn't found, return empty string to avoid errors
    if (!layerConfig) {
        console.warn(`Layer config not found for ID: ${layerId}`);
        return '';
    }

    // 2. Calculate hours (e.g., index 1 -> 6 hours)
    const hours = index * 6;
    
    // 3. Construct filename using the specific suffix from config
    // Example: "6h" + "_icing" + ".png"
    const filename = `${hours}h${layerConfig.suffix}.png`; 

    // 4. Return URL: /api/forecast/images/{folder}/{filename}
    // Example: .../api/forecast/images/icing/6h_icing.png
    return `${API_BASE_URL}/api/forecast/images/${layerConfig.folder}/${filename}`;
};