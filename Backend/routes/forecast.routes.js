import express from 'express';
import { getForecastMetadata, getForecastImage } from '../controllers/forecast.controller.js';

const router = express.Router();

router.get('/metadata', getForecastMetadata);

// UPDATED ROUTE: Now accepts :layer (e.g., 'rain', 'icing') and :filename
router.get('/images/:layer/:filename', getForecastImage);

export default router;