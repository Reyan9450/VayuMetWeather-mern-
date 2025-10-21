import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse'; // For parsing CSV
import { parseStringPromise } from 'xml2js'; // For parsing stations.xml

// Helper function to read, parse, and prepare all data
async function getProcessedMetarData() {
    // Define file paths
    const metarFilePath = path.join(process.cwd(), 'staticFiles', 'metar.csv');
    const stationsFilePath = path.join(process.cwd(), 'staticFiles', 'stations.xml');

    // Read both files at the same time
    const [metarFileContent, stationsFileContent] = await Promise.all([
        fs.readFile(metarFilePath, 'utf8'),
        fs.readFile(stationsFilePath, 'utf8')
    ]);

    // Parse the METAR CSV data
    const metarData = Papa.parse(metarFileContent, {
        header: true, // Uses the first row as headers
        skipEmptyLines: true
    }).data;

    // Parse the Stations XML to create a name lookup map
    const parsedStationsData = await parseStringPromise(stationsFileContent);
    const stationNodes = parsedStationsData.response.data[0].Station;
    const stationNameMap = {};
    for (const node of stationNodes) {
        if (node.station_id && node.site) {
            stationNameMap[node.station_id[0]] = node.site[0];
        }
    }

    // Combine the data, adding the full station name to each METAR report
    const enrichedMetarData = metarData.map(metar => ({
        ...metar,
        station_name: stationNameMap[metar.station_id] || metar.station_id // Fallback to ID if name not found
    }));

    return { enrichedMetarData, stationNodes };
}

/**
 * @desc    Get ALL METAR reports
 * @route   GET /api/metars
 */
export const getAllMetars = async (req, res) => {
    try {
        const { enrichedMetarData } = await getProcessedMetarData();
        res.json(enrichedMetarData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get a single METAR report by station ID (e.g., VIDP)
 * @route   GET /api/metars/:stationId
 */
export const getMetarByStationId = async (req, res) => {
    try {
        const { enrichedMetarData } = await getProcessedMetarData();
        const requestedStationId = req.params.stationId.toUpperCase();

        const metarRecord = enrichedMetarData.find(m => m.station_id === requestedStationId);

        if (!metarRecord) {
            return res.status(404).json({ msg: `METAR data not found for station ${requestedStationId}` });
        }

        res.json(metarRecord);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get a single METAR report by full station name (e.g., DELHI/PALAM)
 * @route   GET /api/metars/name/:stationName
 */
export const getMetarByStationName = async (req, res) => {
    try {
        const { enrichedMetarData, stationNodes } = await getProcessedMetarData();
        const requestedStationName = decodeURIComponent(req.params.stationName).toUpperCase();

        // Find the station in the stations list to get its ID
        const stationRecord = stationNodes.find(node => node.site[0].toUpperCase() === requestedStationName);

        if (!stationRecord) {
            return res.status(404).json({ msg: `Station '${requestedStationName}' not found.` });
        }
        const stationId = stationRecord.station_id[0];

        // Find the METAR data using the ID
        const metarRecord = enrichedMetarData.find(m => m.station_id === stationId);

        if (!metarRecord) {
            return res.status(404).json({ msg: `METAR data not found for station ${stationId}` });
        }

        res.json(metarRecord);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};