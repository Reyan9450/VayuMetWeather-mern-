import { getTafData } from '../utils/dataCache.js';

/**
 * @desc    Get ALL TAF reports from cache
 * @route   GET /api/tafs
 */
export const getAllTafs = async (req, res) => {
  try {
    const allTafs = await getTafData(); // Get data from fast cache
    res.json(allTafs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single TAF report by station ID from cache
 * @route   GET /api/tafs/:stationId
 */
export const getTafByStationId = async (req, res) => {
  try {
    const requestedStationId = req.params.stationId.toUpperCase();
    const allTafs = await getTafData(); // Get data from fast cache
    
    const tafRecord = allTafs.find(taf => taf.station_id === requestedStationId);

    if (!tafRecord) {
      return res.status(404).json({ msg: `TAF data not found for station ${requestedStationId}` });
    }
    res.json(tafRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single TAF report by full station name from cache
 * @route   GET /api/tafs/name/:stationName
 */
export const getTafByStationName = async (req, res) => {
  try {
    const requestedStationName = decodeURIComponent(req.params.stationName).toUpperCase();
    const allTafs = await getTafData(); // Get data from fast cache

    const tafRecord = allTafs.find(taf => taf.station_name?.toUpperCase() === requestedStationName);

    if (!tafRecord) {
      return res.status(404).json({ msg: `Station '${requestedStationName}' not found.` });
    }
    res.json(tafRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
