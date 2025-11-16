import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Must match the config in your backend dataCache.js
const sigmetHazardConfig = {
  'TS': '#FF0000',
  'ICE': '#00BFFF',
  'TURB': '#FFA500',
  'VA': '#696969',
  'TC': '#DC143C',
  'DS/SS': '#DAA520',
  'OTHER': '#808080'
};

const SigmetLegend = () => {
  const map = useMap();

  React.useEffect(() => {
    const legend = L.control({ position: 'bottomleft' }); // Position in bottom left

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend p-2 bg-gray-800/80 dark:bg-black/80 text-white rounded-md shadow-lg');
      div.innerHTML += '<h4 class="font-bold text-sm mb-1">SIGMET Hazards</h4>';
      for (const category in sigmetHazardConfig) {
        div.innerHTML += 
          `<div class="flex items-center">
             <i class="w-4 h-4 mr-2" style="background:${sigmetHazardConfig[category]}"></i>
             <span>${category}</span>
           </div>`;
      }
      return div;
    };

    legend.addTo(map);

    // Cleanup function
    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

export default SigmetLegend;