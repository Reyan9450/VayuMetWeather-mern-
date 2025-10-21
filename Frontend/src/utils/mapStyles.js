import L from 'leaflet';

// Lookup object for Tailwind CSS classes based on flight category
const flightCategoryStyles = {
  VFR: 'bg-green-400 border-green-600 text-black after:border-t-green-600',
  MVFR: 'bg-blue-400 border-blue-600 text-white after:border-t-blue-600',
  IFR: 'bg-red-400 border-red-600 text-white after:border-t-red-600',
  LIFR: 'bg-purple-400 border-purple-600 text-white after:border-t-purple-600',
  UNKNOWN: 'bg-gray-400 border-gray-500 text-black after:border-t-gray-500',
};

// This function now lives in its own file and can be imported anywhere
export const createMetarIcon = (metar) => {
    const category = metar.flight_category || 'UNKNOWN';
    const categoryClasses = flightCategoryStyles[category] || flightCategoryStyles.UNKNOWN;

    const html = `
        <div class="flex flex-col items-center">
            <div>${metar.station_id}</div>
            <div>${metar.wind_dir_degrees ? `${metar.wind_dir_degrees}°/${metar.wind_speed_kt}kt` : 'N/A'}</div>
            <div>${metar.visibility_statute_mi ? `${metar.visibility_statute_mi}sm` : 'N/A'}</div>
        </div>
    `;

    const iconClasses = `
        relative p-0.5 rounded border font-bold text-xs leading-tight whitespace-nowrap
        ${categoryClasses}
        marker-pointer 
    `;

    return L.divIcon({
        html: html,
        className: iconClasses,
        iconSize: [80, 50],
        iconAnchor: [40, 56],
    });
};