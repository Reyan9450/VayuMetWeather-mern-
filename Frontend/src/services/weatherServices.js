import axios from 'axios';

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

// Generate the exact filename your backend expects
export const getForecastImageUrl = (index) => {
    // index 0 -> 0 hours
    // index 1 -> 6 hours
    // index 2 -> 12 hours
    const hours = index * 6;
    
    // Matches your file naming: "0h_raint.png", "6h_raint.png"
    const filename = `${hours}h_raint.png`; 

    return `${API_BASE_URL}/api/forecast/images/${filename}`;
};
