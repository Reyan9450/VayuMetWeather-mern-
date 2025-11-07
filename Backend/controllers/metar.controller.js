import { getMetarData } from '../utils/dataCache.js';

/**
 * @desc    Get ALL METAR reports from cache
 * @route   GET /api/metars
 */
export const getAllMetars = async (req, res) => {
    try {
        const allMetars = await getMetarData(); // Get data from fast cache
        res.json(allMetars);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get a single METAR report by station ID from cache
 * @route   GET /api/metars/:stationId
 */
export const getMetarByStationId = async (req, res) => {
    try {
        const requestedStationId = req.params.stationId.toUpperCase();
        const allMetars = await getMetarData(); // Get data from fast cache
        
        const metarRecord = allMetars.find(m => m.station_id === requestedStationId);

        if (!metarRecord) {
            return res.status(4404).json({ msg: `METAR data not found for station ${requestedStationId}` });
        }
        res.json(metarRecord);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get a single METAR report by full station name from cache
 * @route   GET /api/metars/name/:stationName
 */
export const getMetarByStationName = async (req, res) => {
    try {
        const requestedStationName = decodeURIComponent(req.params.stationName).toUpperCase();
        const allMetars = await getMetarData(); // Get data from fast cache

        const metarRecord = allMetars.find(m => m.station_name?.toUpperCase() === requestedStationName);

        if (!metarRecord) {
            return res.status(404).json({ msg: `Station '${requestedStationName}' not found.` });
        }
        res.json(metarRecord);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get METAR reports filtered by a bounding box
 * @route   GET /api/metars/mapdata
 */
export const getMetarsByBbox = async (req, res) => {
    try {
        const { bbox } = req.query; // Get 'bbox' from query params

        if (!bbox) {
            console.log("Request to /mapdata missing bbox, returning empty array.");
            return res.json([]);
        }

        const [north, west, south, east] = bbox.split(',').map(parseFloat);
        const allMetars = await getMetarData(); // Get all data from cache

        const filteredMetars = allMetars.filter(metar => {
            const lat = parseFloat(metar.latitude);
            const lon = parseFloat(metar.longitude);
            return (lat <= north && lat >= south && lon >= west && lon <= east);
        });

        res.json(filteredMetars);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};