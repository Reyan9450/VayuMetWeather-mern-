import axios from 'axios';

// This logic automatically selects the correct URL for dev vs. production
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://vayumet-weather-server.onrender.com'
  : '';

// We only need the functions that fetch ALL data
export const fetchAllMetars = async () => {
    try {
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
        const response = await axios.get(`${API_BASE_URL}/api/sigmets`);
        console.log("Fetched SIGMET list:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching SIGMET list:", error);
        return [];
    }
};