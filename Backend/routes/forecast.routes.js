import express from 'express';
import { getForecastMetadata, getForecastImage } from '../controllers/forecast.controller.js';

const router = express.Router();

router.get('/metadata', getForecastMetadata);
router.get('/images/:filename', getForecastImage);

export default router;