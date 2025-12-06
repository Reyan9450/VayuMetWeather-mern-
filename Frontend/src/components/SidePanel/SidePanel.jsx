import React, { useState } from 'react';
// Import icons
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
  const [isOpen, setIsOpen] = useState(false);

  // 1. Handlers
  const handleBaseLayerChange = (id) => {
    setActiveBaseLayer(id);
    if (id === 'dark') setTheme('dark');
    if (id === 'osm' || id === 'satellite') setTheme('light');
  };

  // Logic: Mutually exclusive toggle. 
  // If clicking the active one, turn it off (set to null). 
  // Otherwise, switch to the new one.
  const handleForecastLayerChange = (id) => {
    setActiveForecastLayer(prev => (prev === id ? null : id));
  };

  return (
    <>
      {/* Toggle Button (Top Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 z-[1001] flex items-center gap-2 rounded-full bg-gray-800/90 dark:bg-black/80 backdrop-blur-md text-white px-4 py-2 font-semibold shadow-lg transition-all hover:scale-105 hover:bg-blue-600"
      >
        <Layers size={18} />
        <span>Layers</span>
      </button>

      {/* Sidebar Container */}
      <div
        className={`absolute top-0 right-0 h-full z-[1000] bg-gray-900/95 dark:bg-black/90 backdrop-blur-md text-gray-100 transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-72 p-5 overflow-y-auto border-l border-gray-700`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            VayuMet
          </h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* 1. BASE LAYERS (Radio) */}
        <Section title="Base Maps">
          {baseLayers.map(layer => (
            <LayerItem 
                key={layer.id} 
                {...layer} 
                isActive={activeBaseLayer === layer.id} 
                onClick={() => handleBaseLayerChange(layer.id)} 
                type="radio" 
            />
          ))}
        </Section>

        {/* 2. WEATHER LAYERS (Checkbox - Multiple Allowed) */}
        <Section title="Aviation Data">
          {weatherLayers.map(layer => (
            <LayerItem 
                key={layer.id} 
                {...layer} 
                isActive={activeWeatherLayers[layer.id]} 
                onClick={() => toggleWeatherLayer(layer.id)} 
                type="checkbox" 
            />
          ))}
        </Section>
        
        {/* 3. FORECAST ELEMENTS (Radio - Exclusive) */}
        {/* This includes your new RAIN layer */}
        <Section title="Forecast Models">
          {forecastElements.map(layer => (
            <LayerItem 
                key={layer.id} 
                {...layer} 
                isActive={activeForecastLayer === layer.id} 
                onClick={() => handleForecastLayerChange(layer.id)} 
                type="radio" 
            />
          ))}
        </Section>

        {/* 4. PARTICULATE MATTER (Radio - Exclusive) */}
        {/* Note: This shares state with Forecast, so switching to PM turns off Rain */}
        <Section title="Air Quality">
          {particulateMatter.map(layer => (
            <LayerItem 
                key={layer.id} 
                {...layer} 
                isActive={activeForecastLayer === layer.id} 
                onClick={() => handleForecastLayerChange(layer.id)} 
                type="radio" 
            />
          ))}
        </Section>
      </div>
    </>
  );
};

// --- Helper Components ---

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const LayerItem = ({ name, isActive, onClick, type }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 group ${
      isActive 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
        : 'hover:bg-gray-800 text-gray-300 border border-transparent'
    }`}
  >
    <span className="text-sm font-medium">{name}</span>
    
    <div className={`relative flex items-center justify-center w-5 h-5 transition-all ${
        isActive ? 'scale-110' : 'group-hover:scale-110'
    }`}>
      {/* Radio Circle */}
      {type === 'radio' && (
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            isActive ? 'border-blue-400' : 'border-gray-500'
        }`}>
          {isActive && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
        </div>
      )}

      {/* Checkbox Square */}
      {type === 'checkbox' && (
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
            isActive ? 'border-blue-400 bg-blue-400/20' : 'border-gray-500'
        }`}>
           {isActive && <div className="w-2.5 h-2.5 bg-blue-400 rounded-sm shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
        </div>
      )}
    </div>
  </div>
);

export default SidePanel;