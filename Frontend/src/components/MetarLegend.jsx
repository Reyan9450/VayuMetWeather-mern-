import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const flightCategoryColors = {
  VFR: '#79c88d',  // Green
  MVFR: '#79a1c8', // Blue
  IFR: '#c87979',   // Red
  LIFR: '#c079c8', // Magenta
  UNKNOWN: '#aaaaaa' // Gray
};

const MetarLegend = () => {
  const map = useMap();

  React.useEffect(() => {
    // Change the position here
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend p-2 bg-gray-800/80 dark:bg-black/80 text-white rounded-md shadow-lg');
      div.innerHTML += '<h4 class="font-bold text-sm mb-1">Flight Category</h4>';
      for (const category in flightCategoryColors) {
        div.innerHTML += 
          `<div class="flex items-center">
             <i class="w-4 h-4 mr-2" style="background:${flightCategoryColors[category]}"></i>
             <span>${category}</span>
           </div>`;
      }
      return div;
    };

    legend.addTo(map);

    // Cleanup function to remove the legend when the component unmounts
    return () => {
      legend.remove();
    };
  }, [map]);

  return null; // This component doesn't render any visible React elements
};

export default MetarLegend;