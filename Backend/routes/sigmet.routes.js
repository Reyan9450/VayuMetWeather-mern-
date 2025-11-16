import express from 'express';
import { getAllSigmets } from '../controllers/sigmet.controller.js';

const router = express.Router();

// This is the only route we need for SIGMETs
router.route('/').get(getAllSigmets);

export default router;