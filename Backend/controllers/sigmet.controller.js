import { getSigmetData } from '../utils/dataCache.js';

/**
 * @desc    Get ALL active SIGMETs from cache
 * @route   GET /api/sigmets
 */
export const getAllSigmets = async (req, res) => {
    try {
        const allSigmets = await getSigmetData(); // Get data from fast cache
        res.json(allSigmets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};