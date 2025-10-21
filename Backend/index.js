import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import metarRoutes from './routes/metar.routes.js';
// 1. Import your new TAF routes
import tafRoutes from './routes/taf.routes.js';

dotenv.config();

const app = express();
// The database connection can be removed if you are only reading from local files
// connectDB(); 
const corsOptions = {
  origin: 'YOUR_VERCEL_APP_URL', // e.g., 'https://vayumet-weather.vercel.app'
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req, res) => res.send('VayuMet API Running'));

// 2. Tell Express to use your TAF routes
// Any request to a URL starting with "/api/tafs" will be handled by the tafRoutes file.
app.use('/api/tafs', tafRoutes);
app.use('/api/metars', metarRoutes); 



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));