import axios from 'axios';


// Fetches all METAR data from your backend
export const fetchMetars = async () => {
    try {
        const response = await axios.get('/api/metars');
        return response.data;
    } catch (error) {
        console.error("Error fetching METAR data:", error);
        return []; // Return an empty array on error
    }
};

// Fetches all TAF data from your backend
export const fetchTafs = async () => {
    try {
        const response = await axios.get('/api/tafs');
        return response.data;
    } catch (error) {
        console.error("Error fetching TAF data:", error);
        return [];
    }
};