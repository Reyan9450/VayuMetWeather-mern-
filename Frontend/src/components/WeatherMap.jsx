import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import TafPopup from './TafPopup/TafPopup';
import MetarPopup from './MetarPopup/MetarPopup';
import MetarLegend from './MetarLegend';
import { fetchMetars, fetchTafs } from '../services/weatherServices.js'; // ✅ Import your fetch-based functions

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
    attribution: 'Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Define the colors for METAR flight categories
const flightCategoryColors = {
  VFR: '#79c88d',   // Green
  MVFR: '#79a1c8',  // Blue
  IFR: '#c87979',   // Red
  LIFR: '#c079c8',  // Magenta/Purple
  UNKNOWN: '#aaaaaa' // Gray
};

const WeatherMap = ({ theme, activeWeatherLayers }) => {
  const mapCenter = [20.5937, 78.9629];
  const zoomLevel = 5;
  const [tafs, setTafs] = useState([]);
  const [metars, setMetars] = useState([]);

  const worldBounds = [
    [-90, -180],
    [90, 180]
  ];

  useEffect(() => {
    if (activeWeatherLayers.tafs) {
      fetchTafs().then(setTafs);
    } else {
      setTafs([]);
    }

    if (activeWeatherLayers.metars) {
      fetchMetars().then(setMetars);
    } else {
      setMetars([]);
    }
  }, [activeWeatherLayers]);

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
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url={themes[theme]?.url || themes.osm.url}
        attribution={themes[theme]?.attribution || themes.osm.attribution}
        noWrap={true}
      />

      {/* TAF markers */}
      {activeWeatherLayers.tafs && tafs.map(taf => (
        taf.latitude && taf.longitude && (
          <CircleMarker
            key={`taf-${taf.station_id}`}
            center={[+taf.latitude, +taf.longitude]}
            radius={5}
            pathOptions={{ color: '#9370DB', fillColor: '#9370DB', fillOpacity: 0.7 }}
          >
            <Popup><TafPopup taf={taf} /></Popup>
          </CircleMarker>
        )
      ))}

      {/* METAR markers */}
      {activeWeatherLayers.metars && metars.map(metar => (
        metar.latitude && metar.longitude && (
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
            <Popup><MetarPopup metar={metar} /></Popup>
          </CircleMarker>
        )
      ))}

      {activeWeatherLayers.metars && <MetarLegend />}
    </MapContainer>
  );
};

export default WeatherMap;
