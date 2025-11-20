import React, { useState } from 'react';
import WeatherMap from './components/WeatherMap';
import SidePanel from './components/SidePanel/SidePanel.jsx';
import { baseLayers, weatherLayers, forecastElements, particulateMatter } from './config/layer.js';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeBaseLayer, setActiveBaseLayer] = useState('osm');
  const [activeWeatherLayers, setActiveWeatherLayers] = useState({
    tafs: true, metars: true, sigmets: false, windsAloft: false, weatherSymbols: false
  });
  
  // New state for the exclusive forecast layers
  const [activeForecastLayer, setActiveForecastLayer] = useState(null); // null means none are active

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
        activeForecastLayer={activeForecastLayer} // Pass the new state down
      />
    </div>
  );
}

export default App;