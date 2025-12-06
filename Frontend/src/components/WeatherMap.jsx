import React, { useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, Polygon, Marker, ImageOverlay } from 'react-leaflet'; 
import TafPopup from './TafPopup/TafPopup';
import MetarPopup from './MetarPopup/MetarPopup';
import MetarLegend from './MetarLegend';
import SigmetLegend from './SigmetLegend/SigmetLegend';
import DataFetcher from './DataFetcher/DataFetcher';
import WeatherSymbolLegend from "./WeatherSymbolLegend/WeatherSymbolLegend";
import { getForecastImageUrl } from '../services/weatherServices.js';
import L from 'leaflet';

// Theme configuration for base maps
const themes = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  }
};

// Helper to create custom icon for weather symbols
const createWeatherIcon = (url) => {
  return L.icon({
    iconUrl: url || '/icons/clear-day.svg',
    iconSize: [30, 30], 
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Color mapping for METAR flight categories
const flightCategoryColors = {
  VFR: '#79c88d',   // Green
  MVFR: '#79a1c8',  // Blue
  IFR: '#c87979',   // Red
  LIFR: '#c079c8',  // Magenta
  UNKNOWN: '#aaaaaa' // Gray
};

const WeatherMap = ({ 
    theme, 
    activeWeatherLayers, 
    activeForecastLayer, // Prop from App (e.g., 'rain', 'icing', 'pm2_5')
    forecastIndex,       // Prop from App (Current time step index)
    forecastMeta         // Prop from App (Metadata with bounds)
}) => {
  const mapCenter = [20.5937, 78.9629];
  const zoomLevel = 5;

  // Local state for cached data
  const [tafsCache, setTafsCache] = useState(new Map());
  const [metarsCache, setMetarsCache] = useState(new Map());
  
  // State for currently visible markers (filtered by DataFetcher)
  const [visibleTafs, setVisibleTafs] = useState([]);
  const [visibleMetars, setVisibleMetars] = useState([]);
  const [sigmets, setSigmets] = useState([]); 

  // Max bounds to prevent panning too far
  const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

  const getMetarColor = (category) => flightCategoryColors[category] || flightCategoryColors.UNKNOWN;

  return (
    <MapContainer
      className="map-container"
      center={mapCenter}
      zoom={zoomLevel}
      scrollWheelZoom={true}
      minZoom={4}
      maxBounds={worldBounds}
      maxBoundsViscosity={1.0}
      style={{ width: "100%", height: "100vh" }}
    >
      {/* 1. Base Map Layer */}
      <TileLayer
        url={themes[theme]?.url || themes.osm.url}
        attribution={themes[theme]?.attribution || themes.osm.attribution}
        noWrap={true}
      />

      {/* 2. Headless Data Fetcher Component */}
      <DataFetcher
        activeWeatherLayers={activeWeatherLayers}
        tafsCache={tafsCache}
        metarsCache={metarsCache}
        setTafsCache={setTafsCache}
        setMetarsCache={setMetarsCache}
        setVisibleTafs={setVisibleTafs}
        setVisibleMetars={setVisibleMetars}
        setSigmets={setSigmets} 
      />

      {/* 3. DYNAMIC FORECAST OVERLAY (Rain, Icing, etc.) */}
      {/* Renders only if a forecast layer is active and metadata is loaded */}
      {activeForecastLayer && forecastMeta && (
        <ImageOverlay
            // Dynamically fetch URL based on layer ID and current time index
            url={getForecastImageUrl(activeForecastLayer, forecastIndex)}
            bounds={[
                [forecastMeta.bounds.south, forecastMeta.bounds.west], // SouthWest
                [forecastMeta.bounds.north, forecastMeta.bounds.east]  // NorthEast
            ]}
            opacity={0.6}
            zIndex={500}
        />
      )}

      {/* 4. TAF Markers (Purple Circles) */}
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

      {/* 5. METAR Markers (Colored Flight Category Circles) */}
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
     
      {/* 6. Weather Icon Markers (Sun, Rain, Cloud icons) */}
      {activeWeatherLayers.weatherForecast && visibleMetars.map(metar => (
        <Marker
          key={`wx-${metar.station_id}`}
          position={[+metar.latitude, +metar.longitude]}
          icon={createWeatherIcon(metar.iconUrl)} 
        >
           <Popup className='custom-popup'><MetarPopup metar={metar} /></Popup>
        </Marker>
      ))}
 
      {/* 7. SIGMET Polygons */}
      {activeWeatherLayers.sigmets && sigmets.map(sigmet => (
        <Polygon
          key={`sigmet-${sigmet.id}`} 
          positions={sigmet.coordinates} 
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

      {/* 8. Legends */}
      {activeWeatherLayers.weatherForecast && <WeatherSymbolLegend />}
      {activeWeatherLayers.metars && <MetarLegend />}
      {activeWeatherLayers.sigmets && <SigmetLegend />}

    </MapContainer>
  );
};

export default WeatherMap;