import axios from 'axios';

// Define the base URL for your deployed backend
// IMPORTANT: Replace with your actual Render backend URL
const API_BASE_URL = 'https://vayumet-weather-server.onrender.com/';


// Fetches all METAR data from your backend
export const fetchMetars = async () => {
    try {
        // Use the full API_BASE_URL
        const response = await axios.get(`${API_BASE_URL}/api/metars`);
        return response.data;
    } catch (error) {
        console.error("Error fetching METAR data:", error);
        return []; // Return an empty array on error
    }
};

// Fetches all TAF data from your backend
export const fetchTafs = async () => {
    try {
        // Use the full API_BASE_URL
        const response = await axios.get(`${API_BASE_URL}/api/tafs`);
        return response.data;
    } catch (error) {
        console.error("Error fetching TAF data:", error);
        return [];
    }
};