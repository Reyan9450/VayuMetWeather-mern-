import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import axios from 'axios';
import TafPopup from './TafPopup/TafPopup';
import MetarPopup from './MetarPopup/MetarPopup';
// Removed createMetarIcon import as we are now using CircleMarkers with dynamic colors
import MetarLegend from './MetarLegend'; // Import the new legend component

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

// --- Data Fetching Functions ---
const fetchAllTafs = async () => {
  try {
    const response = await axios.get('/api/tafs');
    return response.data;
  } catch (error) {
    console.error("Error fetching TAF list:", error);
    return [];
  }
};

const fetchAllMetars = async () => {
  try {
    const response = await axios.get('/api/metars');
    return response.data;
  } catch (error) {
    console.error("Error fetching METAR list:", error);
    return [];
  }
};

// Define the colors for METAR flight categories here,
// which will be used by both the markers and the legend.
const flightCategoryColors = {
  VFR: '#79c88d',  // Green
  MVFR: '#79a1c8', // Blue
  IFR: '#c87979',   // Red
  LIFR: '#c079c8', // Magenta/Purple
  UNKNOWN: '#aaaaaa' // Gray
};


const WeatherMap = ({ theme, activeWeatherLayers, activeForecastLayer }) => {
    const mapCenter = [20.5937, 78.9629];
    const zoomLevel = 5;
    const [tafs, setTafs] = useState([]);
    const [metars, setMetars] = useState([]);

    const worldBounds = [
        [-90, -180], // Southwest corner
        [90, 180]   // Northeast corner
    ];

    useEffect(() => {
        if (activeWeatherLayers.tafs) {
            fetchAllTafs().then(data => setTafs(data));
        } else {
            setTafs([]);
        }

        if (activeWeatherLayers.metars) {
            fetchAllMetars().then(data => setMetars(data));
        } else {
            setMetars([]);
        }
    }, [activeWeatherLayers]);

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

            {/* Conditionally render TAF markers (purple CircleMarkers) */}
            {activeWeatherLayers.tafs && tafs
                .filter(taf => taf.latitude && taf.longitude && !isNaN(parseFloat(taf.longitude)) && !isNaN(parseFloat(taf.latitude)))
                .map(taf => (
                    <CircleMarker
                        key={`taf-${taf.station_id}`}
                        center={[parseFloat(taf.latitude), parseFloat(taf.longitude)]}
                        radius={5}
                        pathOptions={{ color: '#9370DB', fillColor: '#9370DB', fillOpacity: 0.7 }}
                    >
                        <Popup className="custom-popup">
                            <TafPopup taf={taf} />
                        </Popup>
                    </CircleMarker>
            ))}

            {/* Conditionally render METAR markers (dynamically colored CircleMarkers) */}
            {activeWeatherLayers.metars && metars
                .filter(metar => metar.latitude && metar.longitude && !isNaN(parseFloat(metar.longitude)) && !isNaN(parseFloat(metar.latitude)))
                .map(metar => (
                    <CircleMarker
                        key={`metar-${metar.station_id}`}
                        center={[parseFloat(metar.latitude), parseFloat(metar.longitude)]}
                        radius={6} // Slightly larger than TAFs
                        pathOptions={{
                            color: getMetarColor(metar.flight_category),
                            fillColor: getMetarColor(metar.flight_category),
                            fillOpacity: 0.8,
                            weight: 1.5, // Border weight to make them stand out
                        }}
                    >
                        <Popup className="custom-popup">
                            <MetarPopup metar={metar} />
                        </Popup>
                    </CircleMarker>
            ))}

            {/* Conditionally render the MetarLegend component when METARs are active */}
            {activeWeatherLayers.metars && <MetarLegend />}

        </MapContainer>
    );
};

export default WeatherMap;