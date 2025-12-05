import path from 'path';
import fs from 'fs';

// 1. POINT TO THE CORRECT FOLDER
// Your image shows the path is Backend/staticFiles/rain
const RAIN_IMAGES_DIR = path.join(process.cwd(), 'staticFiles', 'rain');

const FORECAST_METADATA = {
    bounds: {
        // Update these coordinates if your images cover a different area
        north: 27.5, 
        south: 6.5,  
        east: 97.5,  
        west: 68.0   
    },
    timestepHours: 6,
    
    // 2. CALCULATE TOTAL TIMESTEPS
    // Your files go from 0h to 120h in the screenshot.
    // Formula: (MaxHour / Step) + 1 -> (120 / 6) + 1 = 21 steps.
    // If you add files up to 288h (12 days), change this to 49.
    totalTimesteps: 21, 
    
    baseTime: new Date().toISOString()
};

/**
 * @desc    Get Forecast Metadata
 * @route   GET /api/forecast/metadata
 */
export const getForecastMetadata = (req, res) => {
    res.json(FORECAST_METADATA);
};

/**
 * @desc    Serve Forecast Image
 * @route   GET /api/forecast/images/:filename
 */
export const getForecastImage = (req, res) => {
    const { filename } = req.params; // e.g., "0h_raint.png"

    // Security: standardizes path to prevent directory traversal
    const safeFilename = path.basename(filename); 
    
    // Construct full path to staticFiles/rain/0h_raint.png
    const imagePath = path.join(RAIN_IMAGES_DIR, safeFilename);

    // console.log("Serving:", imagePath); // Uncomment for debugging

    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        console.error(`Image not found: ${imagePath}`);
        res.status(404).send('Image not found');
    }
};