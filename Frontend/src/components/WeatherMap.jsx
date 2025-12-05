import React, { useState } from 'react';
// Import Polygon
import { MapContainer, TileLayer, Popup, CircleMarker, Polygon,Marker,ImageOverlay } from 'react-leaflet'; 
import TafPopup from './TafPopup/TafPopup';
import MetarPopup from './MetarPopup/MetarPopup';
import MetarLegend from './MetarLegend';
import SigmetLegend from './SigmetLegend/SigmetLegend'; // <-- 1. IMPORT THE NEW LEGEND
import DataFetcher from './DataFetcher/DataFetcher';
import WeatherSymbolLegend from "./WeatherSymbolLegend/WeatherSymbolLegend";
import L from 'leaflet';
import { getForecastImageUrl } from '../services/weatherServices.js';
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

// Helper to create the custom icon object for Leaflet
const createWeatherIcon = (url) => {
//  console.log("Creating weather icon with URL:", url);
  
  return L.icon({
    iconUrl: url || '/icons/clear-day.svg', // Fallback
    iconSize: [30, 30], 
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};


// Define the colors for METAR flight categories
const flightCategoryColors = {
  VFR: '#79c88d',   // Green
  MVFR: '#79a1c8', // Blue
  IFR: '#c87979',   // Red
  LIFR: '#c079c8', // Magenta/Purple
  UNKNOWN: '#aaaaaa' // Gray
};


const WeatherMap = ({ theme, activeWeatherLayers,activeForecastLayer,forecastIndex,forecastMeta }) => {
  const mapCenter = [20.5937, 78.9629];
  const zoomLevel = 5;

  // Caches for all data
  const [tafsCache, setTafsCache] = useState(new Map());
  const [metarsCache, setMetarsCache] = useState(new Map());
  
  // Arrays for currently visible markers
  const [visibleTafs, setVisibleTafs] = useState([]);
  const [visibleMetars, setVisibleMetars] = useState([]);

  // State for SIGMETs (loaded all at once)
  const [sigmets, setSigmets] = useState([]); 

  const worldBounds = L.latLngBounds(
    L.latLng(-90, -180),
    L.latLng(90, 180)
  );

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
        // Pass down the SIGMET setter
        setSigmets={setSigmets} 
      />

      {/* --- Render TAFs --- */}
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

      {/* --- Render METARs --- */}
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
     
     {/* 4. ADD THIS NEW BLOCK FOR WEATHER SYMBOLS */}
      {activeWeatherLayers.weatherForecast && visibleMetars.map(metar => (
        <Marker
          key={`wx-${metar.station_id}`}
          position={[+metar.latitude, +metar.longitude]}
          // Use the helper to create the icon from the URL provided by the backend
          icon={createWeatherIcon(metar.iconUrl)} 
        >
          {/* We can reuse the MetarPopup since it has all the weather info */}
        
        </Marker>
      ))}
 
      {/* --- Render SIGMET Polygons --- */}
      {activeWeatherLayers.sigmets && sigmets.map(sigmet => (
        <Polygon
          key={`sigmet-${sigmet.id}`} 
          positions={sigmet.coordinates} 
          // --- 2. USE THE DYNAMIC COLOR FROM THE BACKEND ---
          pathOptions={{ 
            color: sigmet.color,       
            fillColor: sigmet.color,   
            fillOpacity: 0.3 
          }}
        >
          <Popup className="custom-popup">
            <strong>SIGMET: {sigmet.hazardType}</strong><br/>
            Valid: {sigmet.validFrom} to {sigmet.validTo}<br/>
            Altitude: {sigmet.altitude}
          </Popup>
        </Polygon>
      ))}

      {/* --- NEW: RAIN FORECAST OVERLAY --- */}
      {activeForecastLayer === 'rain' && forecastMeta && (
        <ImageOverlay
            // 1. Generate URL dynamically based on the slider index
            url={getForecastImageUrl(forecastIndex)}
            
            // 2. Set bounds from metadata [[South, West], [North, East]]
            bounds={[
                [forecastMeta.bounds.south, forecastMeta.bounds.west],
                [forecastMeta.bounds.north, forecastMeta.bounds.east]
            ]}
            opacity={0.6}
            zIndex={500}
        />
      )}

      {/* 3. ADD CONDITIONAL RENDER FOR BOTH LEGENDS */}
      {activeWeatherLayers.weatherForecast && <WeatherSymbolLegend />}
      {activeWeatherLayers.metars && <MetarLegend />}
      {activeWeatherLayers.sigmets && <SigmetLegend />}

    </MapContainer>
  );
};

export default WeatherMap;