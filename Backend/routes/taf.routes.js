import express from 'express';
// Import all three controller functions
import { getAllTafs, getTafByStationId, getTafByStationName } from '../controllers/taf.controller.js';

const router = express.Router();

// Route to get ALL TAFs
router.route('/').get(getAllTafs);

// Route to get a TAF by its NAME (e.g., /api/tafs/name/DELHI/PALAM)
router.route('/name/:stationName').get(getTafByStationName);

// Route to get a TAF by its ID (e.g., /api/tafs/VIDP)
router.route('/:stationId').get(getTafByStationId);

export default router;