import React, { useState, useEffect, useRef } from 'react';
import WeatherMap from './components/WeatherMap';
import SidePanel from './components/SidePanel/SidePanel.jsx';
import ForecastSlider from './components/ForecastSlider/ForecastSlider.jsx'; 
import { fetchForecastMetadata } from './services/weatherServices'; 
import { baseLayers, weatherLayers, forecastElements, particulateMatter } from './config/layer.js';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeBaseLayer, setActiveBaseLayer] = useState('osm');
  
  // Standard Aviation Layers (Multiple can be active at once)
  // e.g. You can see METARs and SIGMETs together
  const [activeWeatherLayers, setActiveWeatherLayers] = useState({
    tafs: false, metars: false, sigmets: false, windsAloft: false, weatherForecast: false
  });
  
  // Dynamic Forecast Layers (Rain, Icing, PM2.5, etc.) 
  // Only ONE can be active at a time to prevent visual clutter
  const [activeForecastLayer, setActiveForecastLayer] = useState(null); 

  // --- FORECAST & ANIMATION STATE ---
  const [forecastMeta, setForecastMeta] = useState(null);
  const [forecastIndex, setForecastIndex] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  // Toggle logic for standard layers
  const toggleWeatherLayer = (layerId) => {
    setActiveWeatherLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  // 1. Load Metadata automatically when ANY forecast layer is activated
  // (This fetches bounds and timesteps from the backend)
  useEffect(() => {
    if (activeForecastLayer && !forecastMeta) {
      const loadMeta = async () => {
        const data = await fetchForecastMetadata();
        if (data) setForecastMeta(data);
      };
      loadMeta();
    }
  }, [activeForecastLayer, forecastMeta]);

  // 2. Handle the Animation Loop (Play Button logic)
  useEffect(() => {
    if (isPlaying && forecastMeta) {
      playIntervalRef.current = setInterval(() => {
        setForecastIndex(prev => {
          // Loop back to 0 if we reach the end of the timeline
          return (prev + 1) % forecastMeta.totalTimesteps;
        });
      }, 800); // Speed: 800ms per frame
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, forecastMeta]);

  // 3. Reset logic when closing layers
  useEffect(() => {
    if (!activeForecastLayer) {
        // If layer is closed, stop playing
        setIsPlaying(false);
    }
  }, [activeForecastLayer]);

  return (
    <div className="relative w-screen h-screen" data-theme={theme}>
      <SidePanel
        baseLayers={baseLayers}
        weatherLayers={weatherLayers}
        forecastElements={forecastElements}
        particulateMatter={particulateMatter}
        activeBaseLayer={activeBaseLayer}
        setActiveBaseLayer={setActiveBaseLayer}
        activeWeatherLayers={activeWeatherLayers}
        toggleWeatherLayer={toggleWeatherLayer}
        activeForecastLayer={activeForecastLayer}
        setActiveForecastLayer={setActiveForecastLayer}
        setTheme={setTheme}
      />
      
      <WeatherMap 
        theme={activeBaseLayer}
        activeWeatherLayers={activeWeatherLayers}
        activeForecastLayer={activeForecastLayer} // e.g. "rain", "icing"
        forecastIndex={forecastIndex}             // Current time step (0, 1, 2...)
        forecastMeta={forecastMeta}               // Map bounds
      />

      {/* --- DYNAMIC SLIDER --- */}
      {/* Renders automatically for ANY active forecast layer if metadata is loaded */}
      {activeForecastLayer && forecastMeta && (
        <ForecastSlider
            currentIndex={forecastIndex}
            totalSteps={forecastMeta.totalTimesteps}
            stepHours={forecastMeta.timestepHours}
            baseTime={forecastMeta.baseTime}
            onChange={setForecastIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      )}
    </div>
  );
}

export default App;