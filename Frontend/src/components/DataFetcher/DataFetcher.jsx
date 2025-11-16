import React, { useEffect, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { fetchAllMetars, fetchAllTafs , fetchAllSigmets} from '../../services/weatherServices.js';

const DataFetcher = ({
  activeWeatherLayers,
  setTafsCache,
  setMetarsCache,
  setVisibleTafs,
  setVisibleMetars,
  tafsCache,
  metarsCache,
  setSigmets
  
}) => {
  const map = useMap();

  // --- JOB 1: Background Pre-caching (Runs ONCE) ---
  useEffect(() => {
    // This function will run in the background on first load
    const backgroundLoad = async () => {
      console.log("Starting background load of all data...");
      
      const [allTafs, allMetars] = await Promise.all([
        fetchAllTafs(),
        fetchAllMetars()
      ]);

      // Load TAFs into the main cache
      setTafsCache(() => {
        const newMap = new Map();
        allTafs.forEach(taf => newMap.set(taf.station_id, taf));
        console.log(`Background TAFs loaded: ${newMap.size} stations cached.`);
        return newMap;
      });

      // Load METARs into the main cache
      setMetarsCache(() => {
        const newMap = new Map();
        allMetars.forEach(metar => newMap.set(metar.station_id, metar));
        console.log(`Background METARs loaded: ${newMap.size} stations cached.`);
        return newMap;
      });
    };

    backgroundLoad();
  }, [setTafsCache, setMetarsCache]); // Empty array means this runs only once on mount

  
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

    // Update Visible METARs
    if (activeWeatherLayers.metars) {
      const visible = [];
      for (const metar of metarsCache.values()) {
        const loc = L.latLng(metar.latitude, metar.longitude);
        if (bounds.contains(loc)) {
          visible.push(metar);
        }
      }
      setVisibleMetars(visible);
    } else {
      setVisibleMetars([]);
    }
  }, [map, activeWeatherLayers, tafsCache, metarsCache, setVisibleTafs, setVisibleMetars]);

  // This hook listens for map movements
  useMapEvents({
    moveend: () => { // Fires when the user stops panning or zooming
      updateVisibleMarkers();
    }
  });

  // This hook updates visible markers if the layers are toggled
  useEffect(() => {
    updateVisibleMarkers();
  }, [activeWeatherLayers, updateVisibleMarkers]);

  useEffect(() => {
    if (activeWeatherLayers.sigmets) {
      console.log("Fetching SIGMETs...");
      fetchAllSigmets().then(data => {
        setSigmets(data); // Set the data
      });
    } else {
      setSigmets([]); // Clear data if layer is off
    }
  }, [activeWeatherLayers.sigmets, setSigmets]);

  return null; // This component doesn't render any visible UI
};



export default DataFetcher;