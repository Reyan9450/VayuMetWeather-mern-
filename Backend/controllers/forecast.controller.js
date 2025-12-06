import path from 'path';
import fs from 'fs';

// Point to the root staticFiles directory
const STATIC_FILES_DIR = path.join(process.cwd(), 'staticFiles');

const FORECAST_METADATA = {
    bounds: {
        north: 37.5, 
        south: 6.5,  
        east: 97.5,  
        west: 68.0   
    },
    timestepHours: 6,
    totalTimesteps: 21, 
    baseTime: new Date().toISOString()
};

export const getForecastMetadata = (req, res) => {
    res.json(FORECAST_METADATA);
};

export const getForecastImage = (req, res) => {
    // 1. Get both the layer name (folder) and the filename
    const { layer, filename } = req.params;

    // Security: Remove any ".." or weird characters to prevent directory traversal
    const safeLayer = layer.replace(/[^a-zA-Z0-9_.-]/g, '');
    const safeFilename = path.basename(filename); 
    
    // 2. Construct dynamic path: staticFiles/{layer}/{filename}
    const imagePath = path.join(STATIC_FILES_DIR, safeLayer, safeFilename);

    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        console.error(`Image not found: ${imagePath}`);
        res.status(404).send('Image not found');
    }
};