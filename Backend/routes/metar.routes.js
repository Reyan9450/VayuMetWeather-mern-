import express from 'express';
import { getAllMetars, getMetarByStationId, getMetarByStationName } from '../controllers/metar.controller.js';

const router = express.Router();

router.route('/').get(getAllMetars);
router.route('/name/:stationName').get(getMetarByStationName);
router.route('/:stationId').get(getMetarByStationId);

export default router;