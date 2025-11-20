import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const WeatherSymbolLegend = () => {
  const map = useMap();

  React.useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend p-2 bg-white dark:bg-black/80 dark:text-white rounded shadow');
      div.innerHTML = '<h4 class="font-bold text-xs mb-1">Weather</h4>';
      // Add a few examples
      const items = [
        { name: 'Rain', icon: '/icons/weather/rain.png' },
        { name: 'Clear', icon: '/icons/weather/clear.png' },
        { name: 'Overcast', icon: '/icons/weather/overcast.png' }
      ];
      items.forEach(item => {
        div.innerHTML += `<div class="flex items-center text-xs"><img src="${item.icon}" class="w-4 h-4 mr-1">${item.name}</div>`;
      });
      return div;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map]);

  return null;
};

export default WeatherSymbolLegend;