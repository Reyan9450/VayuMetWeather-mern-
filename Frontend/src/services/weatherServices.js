const API_BASE_URL = "https://vayumet-weather-server.onrender.com";

export const fetchMetars = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/metars`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching METAR data:", err);
    return [];
  }
};

export const fetchTafs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tafs`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching TAF data:", err);
    return [];
  }
};
