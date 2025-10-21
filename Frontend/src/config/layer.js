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
  { id: 'weatherSymbols', name: 'Weather Symbols' },
];

export const forecastElements = [
  { id: 'rain', name: 'Rain' },
  { id: 'clouds', name: 'Clouds' },
  { id: 'temperature', name: 'Temperature' },
  { id: 'icing', name: 'Icing' },
  { id: 'turbulence', name: 'Turbulence' },
];

export const particulateMatter = [
  { id: 'pm10', name: 'PM10' },
  { id: 'pm2_5', name: 'PM2.5' },
  { id: 'so2', name: 'SO2' },
  { id: 'co', name: 'CO' },
];