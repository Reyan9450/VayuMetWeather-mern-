const API_BASE_URL = "https://vayumet-weather-server.onrender.com";

export const fetchMetars = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching METAR data:", error);
    return [];
  }
};

export const fetchTafs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tafs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TAF data:", error);
    return [];
  }
};
