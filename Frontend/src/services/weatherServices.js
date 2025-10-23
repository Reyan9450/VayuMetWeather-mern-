import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchMetars = async () => {
  try {
    const response = await axios.get("https://vayumet-weather-server.onrender.com/api/metars", {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Response:", response);
    return response.data;
  } catch (error) {
    console.error("Axios Error:", error);
    throw error;
  }
};

export const fetchTafs = async () => {
  try {
    const response = await axios.get(`https://vayumet-weather-server.onrender.com/api/tafs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching TAF data:", error);
    return [];
  }
};
