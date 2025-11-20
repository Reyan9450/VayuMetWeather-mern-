// This maps METAR codes to your icon filenames
// Ensure these icons exist in 'client/public/icons/weather/'
const weatherIconMap = {
  'TS': 'thunderstorm.png',
  'RA': 'rain.png',
  'DZ': 'drizzle.png',
  'SN': 'snow.png',
  'FG': 'fog.png',
  'HZ': 'haze.png',
  'BR': 'mist.png',
  // Clouds
  'CLR': 'clear.png',
  'SKC': 'clear.png',
  'FEW': 'few-clouds.png',
  'SCT': 'scattered-clouds.png',
  'BKN': 'broken-clouds.png',
  'OVC': 'overcast.png',
  'DEFAULT': 'default.png'
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
  if (['OVC'].includes(metar.sky_cover_1)) return 'OVC';
  if (['BKN'].includes(metar.sky_cover_1)) return 'BKN';
  if (['SCT'].includes(metar.sky_cover_1)) return 'SCT';
  if (['FEW'].includes(metar.sky_cover_1)) return 'FEW';
  if (['CLR', 'SKC'].includes(metar.sky_cover_1)) return 'CLR';
  return null;
}

export function getWeatherIconUrl(metar) {

  const basePath = '/icons/weather/'; 
  let condition = getPrimaryCondition(metar.wx_string);
  if (!condition) condition = getSkyCover(metar);
  const iconFile = weatherIconMap[condition] || weatherIconMap['DEFAULT'];
  return `${basePath}${iconFile}`;
  
}