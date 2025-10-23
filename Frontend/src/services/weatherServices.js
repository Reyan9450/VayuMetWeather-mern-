import axios from "axios";

const API_BASE_URL = "https://vayumet-weather-server.onrender.com";

export const fetchMetars = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/metars`);
    return res.data; // Axios auto-parses JSON
  } catch (err) {
    console.error(
      "Error fetching METAR data:",
      err.response ? err.response.data : err.message
    );
    return [];
  }
};

export const fetchTafs = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/tafs`);
    return res.data;
  } catch (err) {
    console.error(
      "Error fetching TAF data:",
      err.response ? err.response.data : err.message
    );
    return [];
  }
};
