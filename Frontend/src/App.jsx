import React, { useState,useEffect,useRef } from 'react';
import WeatherMap from './components/WeatherMap';
import SidePanel from './components/SidePanel/SidePanel.jsx';
import { fetchForecastMetadata } from './services/weatherServices';
import ForecastSlider from './components/ForecastSlider/ForecastSlider.jsx';
import { baseLayers, weatherLayers, forecastElements, particulateMatter } from './config/layer.js';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeBaseLayer, setActiveBaseLayer] = useState('osm');
  const [activeWeatherLayers, setActiveWeatherLayers] = useState({
    tafs: false, metars: false, sigmets: false, windsAloft: false, weatherForecast: true
  });
  
  // --- NEW: FORECAST STATE ---
  const [forecastMeta, setForecastMeta] = useState(null);
  const [forecastIndex, setForecastIndex] = useState(0); // 0 to 20
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  // New state for the exclusive forecast layers
  const [activeForecastLayer, setActiveForecastLayer] = useState(null); // null means none are active

  // 1. Load Metadata when user clicks "Rain" layer
  useEffect(() => {
    if (activeForecastLayer === 'rain' && !forecastMeta) {
        const load = async () => {
            const data = await fetchForecastMetadata();
            setForecastMeta(data);
        };
        load();
    }
  }, [activeForecastLayer]);

  // 2. Handle Animation (Play Button)
  useEffect(() => {
    if (isPlaying && forecastMeta) {
        playIntervalRef.current = setInterval(() => {
            setForecastIndex(prev => {
                // Loop back to 0 if we hit the end
                return (prev + 1) % forecastMeta.totalTimesteps;
            });
        }, 800); // Speed: 800ms per frame
    } else {
        clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, forecastMeta]);
  const toggleWeatherLayer = (layerId) => {
    setActiveWeatherLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

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
        setActiveForecastLayer={setActiveForecastLayer} // Pass the new state down
        setTheme={setTheme}
        
      />
      <WeatherMap 
        theme={activeBaseLayer}
        activeWeatherLayers={activeWeatherLayers}
        activeForecastLayer={activeForecastLayer}
        
        forecastIndex={forecastIndex}
        forecastMeta={forecastMeta} // Pass the new state down
      />
      {/* RENDER SLIDER ONLY WHEN RAIN LAYER IS ACTIVE */}
      {activeForecastLayer === 'rain' && forecastMeta && (
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