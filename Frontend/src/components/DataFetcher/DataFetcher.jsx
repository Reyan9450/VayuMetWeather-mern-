import React, { useEffect, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { fetchMetars, fetchTafs } from '../../services/weatherServices.js';

/**
 * This component handles all dynamic data fetching based on map events.
 * It lives inside the MapContainer and has no visible UI.
 */
const DataFetcher = ({ activeWeatherLayers, setTafs, setMetars }) => {
  const map = useMap();

  // We use useCallback to memoize this function so it's not recreated on every render
  const fetchData = useCallback(async () => {
    const bounds = map.getBounds();
    const { _northEast, _southWest } = bounds;
    

    // Format the bounds into the string our API expects: "north,west,south,east"
    const bbox = `${_northEast.lat},${_southWest.lng},${_southWest.lat},${_northEast.lng}`;
    // console.log("Fetching data for bounds:", bbox);
    // Fetch data only for active layers
    if (activeWeatherLayers.tafs) {
      fetchTafs(bbox).then(setTafs);
    } else {
      setTafs([]); // Clear data if layer is off
    }

    if (activeWeatherLayers.metars) {
      fetchMetars(bbox).then(setMetars);
    } else {
      setMetars([]);
    }
  }, [map, activeWeatherLayers, setTafs, setMetars]); // Dependencies

  // This hook listens for map events
  useMapEvents({
    moveend: () => { // Fires when the user stops panning or zooming
      fetchData();
    }
  });

  // This hook triggers a fetch when a layer is toggled on/off
  // It also triggers the very first data load when the map loads
  useEffect(() => {
    fetchData();
  }, [fetchData, activeWeatherLayers]);

  return null; // This component doesn't render any visible UI
};

export default DataFetcher;