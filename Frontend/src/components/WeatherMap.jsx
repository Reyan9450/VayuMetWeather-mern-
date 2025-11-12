import React, { useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import TafPopup from './TafPopup/TafPopup';
import MetarPopup from './MetarPopup/MetarPopup';
import MetarLegend from './MetarLegend';
import DataFetcher from './DataFetcher/DataFetcher.jsx'; // Import the new DataFetcher

// Configuration for different map themes
const themes = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Define the colors for METAR flight categories
const flightCategoryColors = {
  VFR: '#79c88d',   // Green
  MVFR: '#79a1c8', // Blue
  IFR: '#c87979',   // Red
  LIFR: '#c079c8', // Magenta/Purple
  UNKNOWN: '#aaaaaa' // Gray
};

const WeatherMap = ({ theme, activeWeatherLayers }) => {
  const mapCenter = [20.5937, 78.9629];
  const zoomLevel = 5;

  // --- 1. THE "STORE" (Holds ALL data) ---
  // We initialize the state as a new Map() to hold all cached data.
  const [tafsCache, setTafsCache] = useState(new Map());
  const [metarsCache, setMetarsCache] = useState(new Map());

  // --- 2. THE "WINDOW" (Holds ONLY visible data) ---
  // This state holds only the markers that should be on-screen.
  const [visibleTafs, setVisibleTafs] = useState([]);
  const [visibleMetars, setVisibleMetars] = useState([]);

  const worldBounds = [
    [-90, -180], // Southwest corner
    [90, 180]   // Northeast corner
  ];

  // Helper function to get the correct color for a METAR marker
  const getMetarColor = (category) => {
    return flightCategoryColors[category] || flightCategoryColors.UNKNOWN;
  };

  return (
    <MapContainer
      className="map-container"
      center={mapCenter}
      zoom={zoomLevel}
      scrollWheelZoom={true}
      minZoom={4}
      maxBounds={worldBounds}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url={themes[theme]?.url || themes.osm.url}
        attribution={themes[theme]?.attribution || themes.osm.attribution}
        noWrap={true}
      />

      {/* This component handles all the logic:
        1. It loads ALL data into the 'cache' state in the background.
        2. It watches for map movements.
        3. It updates the 'visible' state with only the markers in view.
      */}
      <DataFetcher
        activeWeatherLayers={activeWeatherLayers}
        // Pass down the "STORE"
        tafsCache={tafsCache}
        metarsCache={metarsCache}
        setTafsCache={setTafsCache}
        setMetarsCache={setMetarsCache}
        // Pass down the "WINDOW"
        setVisibleTafs={setVisibleTafs}
        setVisibleMetars={setVisibleMetars}
      />

      {/* TAF markers - Renders ONLY the 'visible' markers for high performance */}
      {activeWeatherLayers.tafs && visibleTafs.map(taf => (
        <CircleMarker
          key={`taf-${taf.station_id}`}
          center={[+taf.latitude, +taf.longitude]}
          radius={5}
          pathOptions={{ color: '#9370DB', fillColor: '#9370DB', fillOpacity: 0.7 }}
        >
          <Popup className='custom-popup'><TafPopup taf={taf} /></Popup>
        </CircleMarker>
      ))}

      {/* METAR markers - Renders ONLY the 'visible' markers for high performance */}
      {activeWeatherLayers.metars && visibleMetars.map(metar => (
        <CircleMarker
          key={`metar-${metar.station_id}`}
          center={[+metar.latitude, +metar.longitude]}
          radius={6}
          pathOptions={{
            color: getMetarColor(metar.flight_category),
            fillColor: getMetarColor(metar.flight_category),
            fillOpacity: 0.8,
            weight: 1.5,
          }}
        >
          <Popup className='custom-popup'><MetarPopup metar={metar} /></Popup>
        </CircleMarker>
      ))}

      {activeWeatherLayers.metars && <MetarLegend />}
    </MapContainer>
  );
};

export default WeatherMap;