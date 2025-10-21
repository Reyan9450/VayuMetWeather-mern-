import React, { useState } from 'react';
// Import the new Layers icon and the X icon for closing
import { Layers, X } from 'lucide-react';

const SidePanel = ({
  baseLayers,
  weatherLayers,
  forecastElements,
  particulateMatter,
  activeBaseLayer,
  setActiveBaseLayer,
  activeWeatherLayers,
  toggleWeatherLayer,
  activeForecastLayer,
  setActiveForecastLayer,
  setTheme
}) => {
  const [isOpen, setIsOpen] = useState(false); // Start with the panel closed by default

  const handleBaseLayerChange = (id) => {
    setActiveBaseLayer(id);
    if (id === 'dark') setTheme('dark');
    if (id === 'osm' || id === 'satellite') setTheme('light');
  };

  const handleForecastLayerChange = (id) => {
    setActiveForecastLayer(prev => (prev === id ? null : id));
  };

  return (
    <>
      {/* New Toggle Button - positioned top-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 z-[1001] flex items-center gap-2 rounded-full bg-gray-800/80 dark:bg-black/80 backdrop-blur-sm text-white px-4 py-2 font-semibold shadow-lg transition-transform hover:scale-105"
      >
        <Layers size={18} />
        Layers
      </button>

      {/* Sidebar Container */}
      <div
        className={`absolute top-0 right-0 h-full z-[1000] bg-gray-800/80 dark:bg-black/80 backdrop-blur-sm text-white transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-64 p-4 overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">VayuMetWeather</h2>
          {/* Add a close button inside the panel */}
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <Section title="Base Layers">
          {baseLayers.map(layer => (
            <LayerItem key={layer.id} {...layer} isActive={activeBaseLayer === layer.id} onClick={() => handleBaseLayerChange(layer.id)} type="radio" />
          ))}
        </Section>

        <Section title="Weather Layers">
          {weatherLayers.map(layer => (
            <LayerItem key={layer.id} {...layer} isActive={activeWeatherLayers[layer.id]} onClick={() => toggleWeatherLayer(layer.id)} type="checkbox" />
          ))}
        </Section>
        
        <Section title="Forecast Elements">
          {forecastElements.map(layer => (
            <LayerItem key={layer.id} {...layer} isActive={activeForecastLayer === layer.id} onClick={() => handleForecastLayerChange(layer.id)} type="radio" />
          ))}
        </Section>

        <Section title="Particulate Matter">
          {particulateMatter.map(layer => (
            <LayerItem key={layer.id} {...layer} isActive={activeForecastLayer === layer.id} onClick={() => handleForecastLayerChange(layer.id)} type="radio" />
          ))}
        </Section>
      </div>
      
      {/* The old toggle button has been removed */}
    </>
  );
};

// Helper components (no changes needed)
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-600 pb-1 mb-2">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const LayerItem = ({ name, isActive, onClick, type }) => (
  <div
    onClick={onClick}
    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
      isActive ? 'bg-blue-500/50' : 'hover:bg-gray-700/50'
    }`}
  >
    {type === 'radio' && (
      <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center mr-3 flex-shrink-0">
        {isActive && <div className="w-2 h-2 rounded-full bg-white"></div>}
      </div>
    )}
    {type === 'checkbox' && (
      <div className="w-4 h-4 rounded border-2 border-gray-400 flex items-center justify-center mr-3 flex-shrink-0">
        {isActive && <div className="w-2 h-2 bg-white"></div>}
      </div>
    )}
    <span className="text-sm">{name}</span>
  </div>
);

export default SidePanel;