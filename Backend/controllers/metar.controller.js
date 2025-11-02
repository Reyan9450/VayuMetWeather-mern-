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
