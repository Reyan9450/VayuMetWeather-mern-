import { promises as fs, watch } from 'fs'; // Import 'watch'
import path from 'path';
import { parseStringPromise } from 'xml2js';
import Papa from 'papaparse'; // For parsing CSV
// Import the helper for weather icons
import { getWeatherIconUrl } from './WeatherIconHelper.js'; 

// --- In-Memory Caches ---
// These variables will hold our processed data
let tafDataCache = null;
let metarDataCache = null;
let stationDataCache = null; // Stations are needed to enrich the other data
let sigmetDataCache = null;

const staticFilesDir = path.join(process.cwd(), 'staticFiles');

// --- SIGMET Hazard Color Configuration ---
const sigmetHazardConfig = {
  'TS': '#FF0000',     // Red (Thunderstorm)
  'ICE': '#00BFFF',    // Deep Sky Blue (Icing)
  'TURB': '#FFA500',   // Orange (Turbulence)
  'VA': '#696969',     // Dim Gray (Volcanic Ash)
  'TC': '#DC143C',     // Crimson (Tropical Cyclone)
  'DS': '#DAA520',     // Goldenrod (Dust Storm)
  'SS': '#DAA520',     // Goldenrod (Sand Storm)
  'DEFAULT': '#808080' // Gray for others
};

// --- Helper Functions to Load and Process Data ---

/**
 * Loads and parses the stations.xml file.
 * This is the base data needed for enrichment.
 */
async function loadAndProcessStationData() {
  try {
    const stationFilePath = path.join(staticFilesDir, 'stations.xml');
    const stationFileContent = await fs.readFile(stationFilePath, 'utf8');
    const parsedStations = await parseStringPromise(stationFileContent);
    
    // Safely parse and format station data
    const stationNodes = parsedStations?.response?.data?.[0]?.Station ?? [];
    const stationMap = {};
    for (const node of stationNodes) {
      const id = node?.station_id?.[0];
      if (id) {
        stationMap[id] = {
          station_name: node?.site?.[0] || id,
          latitude: parseFloat(node?.latitude?.[0]),
          longitude: parseFloat(node?.longitude?.[0])
        };
      }
    }
    console.log("Station data has been reloaded and cached.");
    return stationMap;
  } catch (err) {
    console.error("Error loading station data:", err.message);
    return {};
  }
}

/**
 * Loads TAF data and enriches it with station locations.
 */
async function loadAndProcessTafData() {
  try {
    const stationMap = await getStationData(); // Get station data first
    const tafFilePath = path.join(staticFilesDir, 'taf.xml');
    const tafFileContent = await fs.readFile(tafFilePath, 'utf8');
    const parsedTafData = await parseStringPromise(tafFileContent);

    const allTafReports = parsedTafData?.response?.data?.[0]?.TAF ?? [];
    
    const enrichedTafs = allTafReports.map(tafRecord => {
      const stationId = tafRecord?.station_id?.[0];
      const stationInfo = stationMap[stationId] || {};
      const forecasts = [];

      if (tafRecord?.forecast) {
        for (const fc of tafRecord.forecast) {
          // ... (Your existing robust forecast parsing logic) ...
          const windDir = fc?.wind_dir_degrees?.[0] ?? 'VRB';
          const windSpeed = fc?.wind_speed_kt?.[0] ?? '0';
          const windGust = fc?.wind_gust_kt?.[0];
          const windInfo = windGust ? `${windDir}°/${windSpeed} (gust ${windGust})` : `${windDir}°/${windSpeed}`;
          const visMi = fc?.visibility_statute_mi?.[0];
          let visM = 'N/A';
          if (visMi) visM = (parseFloat(visMi) * 1609.344).toFixed(0) + ' m';
          const skyInfo = fc?.sky_condition?.map(sc => `${sc.$.sky_cover} ${sc.$.cloud_base_ft_agl || ''}`).join('<br>') || 'N/A';

          forecasts.push({
            time_from: formatDateTime(fc?.fcst_time_from?.[0]),
            time_to: formatDateTime(fc?.fcst_time_to?.[0]),
            change_indicator: fc?.change_indicator?.[0] ?? 'N/A',
            wind: windInfo,
            visibility: visM,
            weather: fc?.wx_string?.[0] ?? 'N/A',
            sky_condition: skyInfo
          });
        }
      }

      return {
        ...stationInfo, // Adds station_name, latitude, longitude
        station_id: stationId,
        raw_text: tafRecord?.raw_text?.[0],
        valid_from: formatDateTime(tafRecord?.valid_time_from?.[0]),
        valid_to: formatDateTime(tafRecord?.valid_time_to?.[0]),
        forecasts: forecasts
      };
    }).filter(taf => taf.station_id && taf.latitude && taf.longitude); // Filter out bad data

    console.log("TAF data has been reloaded and cached.");
    return enrichedTafs;
  } catch (err) {
    console.error("Error loading TAF data:", err.message);
    return [];
  }
}

/**
 * Loads METAR data and enriches it with station locations.
 */
async function loadAndProcessMetarData() {
  try {
    const stationMap = await getStationData(); // Get station data first
    const metarFilePath = path.join(staticFilesDir, 'metar.csv');
    const metarFileContent = await fs.readFile(metarFilePath, 'utf8');
    
    // Parse CSV content
    const parseResult = Papa.parse(metarFileContent, {
      header: true,
      skipEmptyLines: true
    });
    
    const allMetarReports = parseResult.data ?? [];

    const enrichedMetars = allMetarReports.map(metarRecord => {
      const stationId = metarRecord?.station_id;
      const stationInfo = stationMap[stationId] || {};

      // --- NEW: Calculate icon URL using helper ---
      const iconUrl = getWeatherIconUrl(metarRecord); 

      return {
        ...metarRecord,
        ...stationInfo, // Adds station_name, latitude, longitude
        flight_category: metarRecord?.flight_category || 'UNKNOWN',
        iconUrl: iconUrl // --- Add the icon URL to the data ---
      };
    }).filter(metar => metar.station_id && metar.latitude && metar.longitude); // Filter out bad data

    console.log("METAR data has been reloaded and cached.");
    return enrichedMetars;
  } catch (err) {
    console.error("Error loading METAR data:", err.message);
    return [];
  }
}

/**
 * Loads and processes SIGMET data from isigmet.json
 */
async function loadAndProcessSigmetData() {
  try {
    const sigmetFilePath = path.join(staticFilesDir, 'isigmet.json');
    const sigmetFileContent = await fs.readFile(sigmetFilePath, 'utf8');
    const sigmetData = JSON.parse(sigmetFileContent);
    
    // Transform the data into the format our frontend needs
    const enrichedSigmets = sigmetData.map((sigmet, index) => {
      
      let leafletCoords = []; // Default to an empty array

      // Check if sigmet.coords is actually a valid array before trying to map it
      if (Array.isArray(sigmet.coords)) {
        leafletCoords = sigmet.coords
          .map(point => {
            // Check if point and its lat/lon are valid numbers
            if (point && typeof point.lat === 'number' && typeof point.lon === 'number') {
              return [point.lat, point.lon];
            }
            return null; // Discard this point if it's invalid
          })
          .filter(coord => coord !== null); // Filter out any null (invalid) points
      }
      
      // Determine color based on hazard type
      const hazard = sigmet.hazard || 'DEFAULT';
      const color = sigmetHazardConfig[hazard] || sigmetHazardConfig['DEFAULT'];

      return {
        id: sigmet.isigmetId || index,
        coordinates: leafletCoords, // Use the new, clean array
        hazardType: sigmet.hazard,
        color: color, // Send the color to the frontend
        altitude: sigmet.top ? `FL${Math.floor(sigmet.base / 100)}-${Math.floor(sigmet.top / 100)}` : 'N/A',
        validFrom: formatDateTime(new Date(sigmet.validTimeFrom * 1000).toISOString()),
        validTo: formatDateTime(new Date(sigmet.validTimeTo * 1000).toISOString()),
        rawSigmet: sigmet.rawSigmet
      };
    })
    // Filter out any SIGMETs that ended up with no valid coordinates
    .filter(sigmet => sigmet.coordinates.length > 0); 

    console.log("SIGMET data has been reloaded and cached.");
    return enrichedSigmets;
  } catch (err) {
    console.error("Error loading SIGMET data:", err.message);
    return [];
  }
}

// Helper to format dates (copied from your TAF logic)
function formatDateTime(isoStr) {
  if (!isoStr) return 'N/A';
  const date = new Date(isoStr);
  if (isNaN(date)) return isoStr;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
}

// --- Public Accessor Functions (Controllers will use these) ---

export const getStationData = async () => {
  if (stationDataCache === null) {
    stationDataCache = await loadAndProcessStationData();
  }
  return stationDataCache;
};

export const getTafData = async () => {
  if (tafDataCache === null) {
    tafDataCache = await loadAndProcessTafData();
  }
  return tafDataCache;
};

export const getMetarData = async () => {
  if (metarDataCache === null) {
    metarDataCache = await loadAndProcessMetarData();
  }
  return metarDataCache;
};

export const getSigmetData = async () => {
  if (sigmetDataCache === null) {
    sigmetDataCache = await loadAndProcessSigmetData();
  }
  return sigmetDataCache;
};

// --- File Watcher Logic ---
// This section automatically clears the cache when you replace a file.

let fsWait = false; // Debounce flag

// Watch the directory for changes
watch(staticFilesDir, (eventType, filename) => {
  if (filename && eventType === 'change' && !fsWait) {
    fsWait = true;
    console.log(`File change detected in 'staticFiles': ${filename}`);

    if (filename.endsWith('stations.xml')) {
      console.log("Station file changed, clearing all caches...");
      stationDataCache = null;
      tafDataCache = null;
      metarDataCache = null;
    } else if (filename.endsWith('taf.xml')) {
      console.log("TAF file changed, clearing TAF cache...");
      tafDataCache = null;
    } else if (filename.endsWith('metar.csv')) {
      console.log("METAR file changed, clearing METAR cache...");
      metarDataCache = null;
    } else if (filename.endsWith('isigmet.json')) {
      console.log("SIGMET file changed, clearing SIGMET cache...");
      sigmetDataCache = null;
    }

    // Debounce to prevent multiple triggers for one file save
    setTimeout(() => {
      fsWait = false;
    }, 100);
  }
});