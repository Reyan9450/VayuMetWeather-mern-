// Maps METAR codes to Meteocons SVG filenames
// Ensure your icons in 'client/public/icons/weather/' match these names exactly.

const weatherIconMap = {
  // Precipitation
  'TS': 'thunderstorms.svg',
  'RA': 'rain.svg',
  'DZ': 'drizzle.svg',
  'SN': 'snow.svg',
  'GR': 'hail.svg', 
  
  // Obscuration
  'FG': 'fog.svg',
  'BR': 'fog.svg', // Mist uses fog icon
  'HZ': 'fog.svg', // Haze uses fog icon
  'DU': 'wind.svg', // Dust uses wind icon
  'SA': 'wind.svg', // Sand uses wind icon
  
  // Clouds
  'CLR': 'clear-day.svg',
  'SKC': 'clear-day.svg',
  'FEW': 'partly-cloudy-day.svg',
  'SCT': 'partly-cloudy-day.svg',
  'BKN': 'cloudy.svg',
  'OVC': 'cloudy.svg',
  
  // Fallback
  'DEFAULT': 'not-available.svg' // Or reuse 'clear-day.svg'
};

function getPrimaryCondition(wxString) {
  if (!wxString || wxString === 'NSW' || wxString === 'N/A') return null;
  const conditions = wxString.replace(/[-+]/g, '').split(' ');
  for (const cond of conditions) {
    if (weatherIconMap[cond]) return cond;
  }
  return null;
}

function getSkyCover(metar) {
  // Order of importance
  if (['OVC', 'BKN'].includes(metar.sky_cover_1)) return 'OVC'; // Maps to cloudy.svg
  if (['SCT', 'FEW'].includes(metar.sky_cover_1)) return 'SCT'; // Maps to partly-cloudy-day.svg
  if (['CLR', 'SKC'].includes(metar.sky_cover_1)) return 'CLR'; // Maps to clear-day.svg
  return null;
}

export function getWeatherIconUrl(metar) {
  const basePath = './icons/'; 
  
  // 1. Check for Weather (Rain, Fog, etc.)
  let condition = getPrimaryCondition(metar.wx_string);
  
  // 2. If no weather, check Clouds
  if (!condition) {
    condition = getSkyCover(metar);
  }
  
  // 3. Get filename
  const iconFile = weatherIconMap[condition] || weatherIconMap['DEFAULT'];
  
  return `${basePath}${iconFile}`;
}