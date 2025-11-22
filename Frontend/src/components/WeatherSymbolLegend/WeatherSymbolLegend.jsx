import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const WeatherSymbolLegend = () => {
  const map = useMap();

  React.useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend p-3 bg-white dark:bg-black/80 dark:text-white rounded-md shadow-lg text-xs');
      
      const addSection = (title, items) => {
        let html = `<h4 class="font-bold mb-1 mt-2 border-b border-gray-300 dark:border-gray-600 pb-1">${title}</h4>`;
        items.forEach(item => {
          html += `
            <div class="flex items-center my-1">
              <img src="${item.icon}" class="w-6 h-6 mr-2" alt="${item.name}">
              <span>${item.name}</span>
            </div>`;
        });
        return html;
      };

      let content = '<h3 class="font-bold text-sm text-center mb-2">Weather Symbols</h3>';

      // 1. Sky Conditions
      const skyItems = [
        { name: 'Clear', icon: './icons/clear-day.svg' },
        { name: 'Partly Cloudy', icon: './icons/partly-cloudy-day.svg' },
        { name: 'Cloudy/Overcast', icon: './icons/cloudy.svg' },
      ];
      content += addSection('Sky', skyItems);

      // 2. Precipitation
      const precipItems = [
        { name: 'Rain', icon: './icons/rain.svg' },
        { name: 'Drizzle', icon: './icons/drizzle.svg' },
        { name: 'Thunderstorm', icon: './icons/thunderstorms.svg' },
        { name: 'Snow', icon: './icons/snow.svg' },
      ];
      content += addSection('Precipitation', precipItems);

      // 3. Visibility/Other
      const otherItems = [
        { name: 'Fog/Mist', icon: './icons/fog.svg' },
        { name: 'Wind/Dust', icon: './icons/wind.svg' },
      ];
      content += addSection('Other', otherItems);

      div.innerHTML = content;
      return div;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map]);

  return null;
};

export default WeatherSymbolLegend;