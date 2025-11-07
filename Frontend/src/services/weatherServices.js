import axios from "axios";

/**
 * Fetches METAR data for a specific bounding box
 * @param {string} bbox - The bounding box string "north,west,south,east"
 */

// Fetches all METAR data from your backend
export const fetchMetars = async (bbox) => {
    if (!bbox) {
        console.log("No bbox provided for fetchMetars, returning empty array.");
        return [];
    }
    try {
        const response = await axios.get(`/api/metars/mapdata?bbox=${bbox}` );
        // console.log("METAR data fetched for bbox:",response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching METAR data:", error);
        return []; // Return an empty array on error
    }
};
/**
 * Fetches TAF data for a specific bounding box
 * @param {string} bbox - The bounding box string "north,west,south,east"
 */
// Fetches all TAF data from your backend
export const fetchTafs = async (bbox) => {
    if (!bbox) {
        console.log("No bbox provided for fetchTafs, returning empty array.");
        return [];
    }
    try {
        const response = await axios.get(`/api/tafs/mapdata?bbox=${bbox}` );
        return response.data;
    } catch (error) {
        console.error("Error fetching TAF data:", error);
        return [];
    }
};
