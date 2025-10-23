import axios from 'axios';

const API_BASE_URL = "https://vayumet-weather-server.onrender.com";

export const fetchMetars = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/metars`, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching METAR data:", error.response || error);
    return [];
  }
};

export const fetchTafs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tafs`, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching TAF data:", error.response || error);
    return [];
  }
};
