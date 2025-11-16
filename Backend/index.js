import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import your routes
import tafRoutes from './routes/taf.routes.js';
import metarRoutes from './routes/metar.routes.js';
import sigmetRoutes from './routes/sigmet.routes.js';
// Import the dataCache to start the file watchers
import './utils/dataCache.js'; 

dotenv.config();
const app = express();


// CORS configuration (update with your Vercel URL)
const corsOptions = {
  origin: ['https://vayu-met-weather-mern.vercel.app', 'http://localhost:5173'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());


app.get('/', (req, res) => res.send('VayuMet API Running'));

// Define Routes
app.use('/api/tafs', tafRoutes);
app.use('/api/metars', metarRoutes);
app.use('/api/sigmets', sigmetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
