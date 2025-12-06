// This file defines the data for our sidebar.
// Icons have been removed for now.

export const baseLayers = [
  { id: 'osm', name: 'Default' },
  { id: 'dark', name: 'Dark' },
  { id: 'satellite', name: 'Satellite' },
];

export const weatherLayers = [
  { id: 'metars', name: 'METAR' },
  { id: 'tafs', name: 'TAF' },
  { id: 'sigmets', name: 'SIGMET' },
  { id: 'windsAloft', name: 'Winds Aloft' },
  { id: 'weatherForecast', name: 'Weather Forecast' },
];

export const forecastElements = [
  { id: 'rain', name: 'Rain', folder: 'rain', suffix: '_raint' },
  { id: 'clouds', name: 'Clouds', folder: 'clouds', suffix: '_tcldt' }, 
  { id: 'cloudlayer', name: 'Cloud Layer', folder: 'cloudlayer', suffix: '_cldt' },
  { id: 'cloudseed', name: 'Cloud Seeding', folder: 'cloudseed', suffix: '_cseedt' },
  { id: 'convection', name: 'Convection', folder: 'convection', suffix: '_CB' },
  { id: 'icing', name: 'Icing', folder: 'icing', suffix: '_300mb_icet' },
  { id: 'turbulence', name: 'Turbulence', folder: 'turbulence', suffix: '_300hPa_turbulence' },
  { id: 'windshear', name: 'Wind Shear', folder: 'WindShear', suffix: '_llwst' },
  { id: 'solar', name: 'Solar', folder: 'solar', suffix: '_solpt' },
  { id: 'windpower', name: 'Wind Power', folder: 'windpower', suffix: '_wipt' },
  { id: 'radref', name: 'Rad Ref', folder: 'radref', suffix: '_radart' },
];

export const particulateMatter = [
  { id: 'pm2_5', name: 'PM 2.5', folder: 'PM2.5', suffix: '_pmft' },
  { id: 'pm10', name: 'PM 10', folder: 'PM10', suffix: '_pmct' },
];