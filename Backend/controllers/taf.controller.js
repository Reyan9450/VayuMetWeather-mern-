import { promises as fs } from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

// ... (your existing getAllTafs function can remain here) ...

/**
 * @desc    Get a single TAF report for a specific station ID
 * @route   GET /api/tafs/:stationId
 * @access  Public
 */

// Helper function to format date/time strings
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

export const getTafByStationId = async (req, res) => {
  try {
    // 1. Get the stationId from the URL parameter (e.g., "VIDP")
    const requestedStationId = req.params.stationId.toUpperCase();

    // 2. Define file paths and read both files concurrently
    const tafFilePath = path.join(process.cwd(), 'staticFiles', 'taf.xml');
    const stationsFilePath = path.join(process.cwd(), 'staticFiles', 'stations.xml');

    const [tafFileContent, stationsFileContent] = await Promise.all([
      fs.readFile(tafFilePath, 'utf8'),
      fs.readFile(stationsFilePath, 'utf8')
    ]);

    // 3. Parse both XML files into JavaScript objects
    const [parsedTafData, parsedStationsData] = await Promise.all([
      parseStringPromise(tafFileContent),
      parseStringPromise(stationsFileContent)
    ]);

    // 4. Create the Station Name Map (just like in your original code)
    const stationNodes = parsedStationsData.response.data[0].Station;
    const stationNameMap = {};
    for (const node of stationNodes) {
      const id = node.station_id[0];
      const name = node.site[0];
      if (id && name) {
        stationNameMap[id] = name;
      }
    }

    // 5. Find the specific TAF report by stationId
    const allTafReports = parsedTafData.response.data[0].TAF;
    const tafRecord = allTafReports.find(taf => taf.station_id[0] === requestedStationId);

    // 6. If no TAF is found, return a 404 error
    if (!tafRecord) {
      return res.status(404).json({ msg: `TAF data not found for station ${requestedStationId}` });
    }

    // 7. Process the forecast data for the found TAF record
    const forecasts = [];
    if (tafRecord.forecast) {
      for (const fc of tafRecord.forecast) {
        forecasts.push({
          fcst_time_from: fc.fcst_time_from[0],
          fcst_time_to: fc.fcst_time_to[0],
          change: fc.change_indicator ? fc.change_indicator[0] : 'N/A',
          wind_dir_degrees: fc.wind_dir_degrees ? fc.wind_dir_degrees[0] : 'VRB',
          wind_speed_kt: fc.wind_speed_kt ? fc.wind_speed_kt[0] : '0',
          wind_gust_kt: fc.wind_gust_kt ? fc.wind_gust_kt[0] : null,
          wx_string: fc.wx_string ? fc.wx_string[0] : 'N/A',
          visibility_mi: fc.visibility_statute_mi ? fc.visibility_statute_mi[0] : 'N/A'
        });
      }
    }

    // 8. Construct the final JSON response object
    const responseJson = {
      station_name: stationNameMap[requestedStationId] || requestedStationId, // Full name or fallback to ID
      station_id: tafRecord.station_id[0],
      raw_text: tafRecord.raw_text[0],
      issue_time: tafRecord.issue_time[0],
      valid_time_from: tafRecord.valid_time_from[0],
      valid_time_to: tafRecord.valid_time_to[0],
      forecasts: forecasts
    };

    // 9. Send the combined data
    res.json(responseJson);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get ALL TAF reports, enriched with full forecast details
 * @route   GET /api/tafs
 * @access  Public
 */
export const getAllTafs = async (req, res) => {
  try {
    const tafFilePath = path.join(process.cwd(), 'staticFiles', 'taf.xml');
    const stationsFilePath = path.join(process.cwd(), 'staticFiles', 'stations.xml');
    
    const [tafFileContent, stationsFileContent] = await Promise.all([
      fs.readFile(tafFilePath, 'utf8'),
      fs.readFile(stationsFilePath, 'utf8')
    ]);

    const [parsedTafData, parsedStationsData] = await Promise.all([
      parseStringPromise(tafFileContent),
      parseStringPromise(stationsFileContent)
    ]);

    // Safely access all nested properties, providing an empty array as a fallback
    const stationNodes = parsedStationsData?.response?.data?.[0]?.Station ?? [];
    const stationNameMap = {};
    for (const node of stationNodes) {
        const id = node?.station_id?.[0];
        const name = node?.site?.[0];
        if (id && name) {
            stationNameMap[id] = name;
        }
    }
    
    const allTafReports = parsedTafData?.response?.data?.[0]?.TAF ?? [];

    const enrichedTafs = allTafReports.map(tafRecord => {
      const stationId = tafRecord?.station_id?.[0];
      const forecasts = [];

      // Safely check if the forecast array exists
      if (tafRecord?.forecast) {
        for (const fc of tafRecord.forecast) {
          // --- Safely access every property with fallbacks ---
          const windDir = fc?.wind_dir_degrees?.[0] ?? 'VRB';
          const windSpeed = fc?.wind_speed_kt?.[0] ?? '0';
          const windGust = fc?.wind_gust_kt?.[0];
          const windInfo = windGust 
            ? `${windDir}°/${windSpeed} (gust ${windGust})`
            : `${windDir}°/${windSpeed}`;

          const visMi = fc?.visibility_statute_mi?.[0];
          let visM = 'N/A';
          if (visMi) {
            visM = (parseFloat(visMi) * 1609.344).toFixed(0) + ' m';
          }

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
        station_name: stationNameMap[stationId] || stationId,
        station_id: stationId,
        latitude: tafRecord?.latitude?.[0],
        longitude: tafRecord?.longitude?.[0],
        raw_text: tafRecord?.raw_text?.[0],
        valid_from: formatDateTime(tafRecord?.valid_time_from?.[0]),
        valid_to: formatDateTime(tafRecord?.valid_time_to?.[0]),
        forecasts: forecasts
      };
    }).filter(taf => taf.station_id); // Final safety check to remove any malformed records

    res.json(enrichedTafs);

  } catch (err) {
    console.error("Server Crash:", err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single TAF report by the full station name
 * @route   GET /api/tafs/name/:stationName
 * @access  Public
 */
export const getTafByStationName = async (req, res) => {
  try {

    // 1. Get the URL-decoded station name from the parameter
    const requestedStationName = decodeURIComponent(req.params.stationName).toUpperCase();
    console.log(`Searching for station name: ${requestedStationName}`);
    // 2. Read both data files
    const tafFilePath = path.join(process.cwd(), 'staticFiles', 'taf.xml');
    const stationsFilePath = path.join(process.cwd(), 'staticFiles', 'stations.xml');

    const [tafFileContent, stationsFileContent] = await Promise.all([
      fs.readFile(tafFilePath, 'utf8'),
      fs.readFile(stationsFilePath, 'utf8')
    ]);

    const [parsedTafData, parsedStationsData] = await Promise.all([
      parseStringPromise(tafFileContent),
      parseStringPromise(stationsFileContent)
    ]);

    // 3. Find the station by name to get its ICAO ID
    const stationNodes = parsedStationsData.response.data[0].Station;
    const stationRecord = stationNodes.find(node => node.site[0].toUpperCase() === requestedStationName);
  

    if (!stationRecord) {
      return res.status(404).json({ msg: `Station '${requestedStationName}' not found.` });
    }
    const stationId = stationRecord.station_id[0]; // This is the ICAO code (e.g., "VIDP")

    // 4. Find the TAF report using the ICAO ID we just found
    const allTafReports = parsedTafData.response.data[0].TAF;
    const tafRecord = allTafReports.find(taf => taf.station_id[0] === stationId);

    if (!tafRecord) {
      return res.status(404).json({ msg: `TAF data not found for station ${stationId}` });
    }

    // 5. Process and return the detailed TAF data (same logic as getTafByStationId)
    const forecasts = [];
    if (tafRecord.forecast) {
      for (const fc of tafRecord.forecast) {
        forecasts.push({
          fcst_time_from: fc.fcst_time_from[0],
          fcst_time_to: fc.fcst_time_to[0],
          change: fc.change_indicator ? fc.change_indicator[0] : 'N/A',
          wind_dir_degrees: fc.wind_dir_degrees ? fc.wind_dir_degrees[0] : 'VRB',
          wind_speed_kt: fc.wind_speed_kt ? fc.wind_speed_kt[0] : '0'
        });
      }
    }

    const responseJson = {
      station_name: stationRecord.site[0],
      station_id: stationId,
      raw_text: tafRecord.raw_text[0],
      issue_time: tafRecord.issue_time[0],
      forecasts: forecasts
    };

    res.json(responseJson);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};