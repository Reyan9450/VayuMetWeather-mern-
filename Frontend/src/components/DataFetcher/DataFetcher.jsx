import React, { useEffect, useCallback, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { 
  
  fetchAllMetars, 
  fetchAllTafs, 
  fetchAllSigmets 
} from '../../services/weatherServices.js';
import L from 'leaflet';

const DataFetcher = ({
  activeWeatherLayers, // Expecting an object: { tafs: true, metars: false, ... }
  setTafsCache,
  setMetarsCache,
  setVisibleTafs,
  setVisibleMetars,
  tafsCache,
  metarsCache,
  setSigmets
}) => {
  const map = useMap();
  const [hasLoadedVisible, setHasLoadedVisible] = useState(false);

  // --- JOB 1: Background Pre-caching (Runs ONCE after initial load) ---
  useEffect(() => {
    const backgroundLoad = async () => {
      console.log("Starting background load of all data...");
      
      // 1. Load TAFs
      if (activeWeatherLayers.tafs) {
        const allTafs = await fetchAllTafs();
        setTafsCache(prevMap => {
          const newMap = new Map(prevMap);
          allTafs.forEach(taf => newMap.set(taf.station_id, taf));
          console.log(`Background TAFs loaded: ${newMap.size} stations cached.`);
          return newMap;
        });
      }

      // 2. Load METARs (Needed if 'metars' OR 'weatherForecast' is active)
      if (activeWeatherLayers.metars || activeWeatherLayers.weatherForecast) {
        const allMetars = await fetchAllMetars();
        setMetarsCache(prevMap => {
          const newMap = new Map(prevMap);
          allMetars.forEach(metar => newMap.set(metar.station_id, metar));
          console.log(`Background METARs loaded: ${newMap.size} stations cached.`);
          return newMap;
        });
      }
    };

    // Only run background load if we've already shown visible data
    if (hasLoadedVisible) {
      const timer = setTimeout(backgroundLoad, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasLoadedVisible, activeWeatherLayers.tafs, activeWeatherLayers.metars, activeWeatherLayers.weatherForecast, setTafsCache, setMetarsCache]);

  
  // --- JOB 2: Update Visible Markers (Runs on Map Move) ---
  const updateVisibleMarkers = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();

    // Update Visible TAFs
    if (activeWeatherLayers.tafs) {
      const visible = [];
      for (const taf of tafsCache.values()) {
        const loc = L.latLng(taf.latitude, taf.longitude);
        if (bounds.contains(loc)) {
          visible.push(taf);
        }
      }
      setVisibleTafs(visible);
    } else {
      setVisibleTafs([]);
    }

    // Update Visible METARs / Weather Forecast
    if (activeWeatherLayers.metars || activeWeatherLayers.weatherForecast) {
      const visible = [];
      for (const metar of metarsCache.values()) {
        const loc = L.latLng(metar.latitude, metar.longitude);
        if (bounds.contains(loc)) {
          visible.push(metar);
        }
      }

      // --- DEBUG: CHECK FOR ICON URL ---
      if (visible.length > 0) {
        // console.log("First visible METAR:", visible[0].station_id);
        console.log("Has iconUrl?", visible);
      }
      // --------------------------------

      setVisibleMetars(visible);
    } else {
      setVisibleMetars([]);
    }

    // Mark initial load as done so background fetching can start
    if (!hasLoadedVisible && (activeWeatherLayers.tafs || activeWeatherLayers.metars || activeWeatherLayers.weatherForecast)) {
      setHasLoadedVisible(true);
    }

  }, [map, activeWeatherLayers, tafsCache, metarsCache, setVisibleTafs, setVisibleMetars, hasLoadedVisible]);


  // --- Event Listeners ---

  useMapEvents({
    moveend: () => { 
      updateVisibleMarkers();
    }
  });

  // Trigger update when layers change
  useEffect(() => {
    updateVisibleMarkers();
  }, [activeWeatherLayers, updateVisibleMarkers]);


  // --- JOB 3: SIGMETs (Independent Logic) ---
  useEffect(() => {
    if (activeWeatherLayers.sigmets) {
      console.log("Fetching SIGMETs...");
      fetchAllSigmets().then(data => {
        setSigmets(data); 
      });
    } else {
      setSigmets([]); 
    }
  }, [activeWeatherLayers.sigmets, setSigmets]);

  return null; 
};

export default DataFetcher;