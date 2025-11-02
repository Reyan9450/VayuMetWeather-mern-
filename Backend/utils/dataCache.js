import { promises as fs, watch } from 'fs'; // Import 'watch'
import path from 'path';
import { parseStringPromise } from 'xml2js';
import Papa from 'papaparse'; // For parsing CSV

// --- In-Memory Caches ---
// These variables will hold our processed data
let tafDataCache = null;
let metarDataCache = null;
let stationDataCache = null; // Stations are needed to enrich the other data

const staticFilesDir = path.join(process.cwd(), 'staticFiles');

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
    const metarFilePath = path.join(staticFilesDir, 'metar.xml'); // <-- Changed to .xml
    const metarFileContent = await fs.readFile(metarFilePath, 'utf8');
    
    // Parse XML content
    const parsedMetarData = await parseStringPromise(metarFileContent);

    const allMetarReports = parsedMetarData?.response?.data?.[0]?.METAR ?? []; // <-- Assuming METAR tag

    const enrichedMetars = allMetarReports.map(metarRecord => {
      const stationId = metarRecord?.station_id?.[0]; // <-- Accessing array element
      const stationInfo = stationMap[stationId] || {};

      return {
        ...stationInfo, // Adds station_name, latitude, longitude
        station_id: stationId,
        raw_text: metarRecord?.raw_text?.[0],
        flight_category: metarRecord?.flight_category?.[0] || 'UNKNOWN',
        // --- Add other METAR-specific fields here, accessing with [0] ---
        observation_time: metarRecord?.observation_time?.[0],
        wind_dir_degrees: metarRecord?.wind_dir_degrees?.[0],
        wind_speed_kt: metarRecord?.wind_speed_kt?.[0],
        visibility_statute_mi: metarRecord?.visibility_statute_mi?.[0],
        temp_c: metarRecord?.temp_c?.[0],
        dewpoint_c: metarRecord?.dewpoint_c?.[0],
        altimeter_in_hg: metarRecord?.altimeter_in_hg?.[0],
      };
    }).filter(metar => metar.station_id && metar.latitude && metar.longitude);

    console.log("METAR data has been reloaded and cached.");
    return enrichedMetars;
  } catch (err) {
    console.error("Error loading METAR data:", err.message);
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
    }

    // Debounce to prevent multiple triggers for one file save
    setTimeout(() => {
      fsWait = false;
    }, 100);
  }
});
