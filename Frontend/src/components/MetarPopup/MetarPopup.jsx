import React from 'react';

const MetarPopup = ({ metar }) => {
  if (!metar) return null;

  return (
    <div className="w-[450px] font-sans text-sm max-h-[300px] overflow-y-auto bg-white text-gray-800 dark:bg-[#2e2e2e] dark:text-gray-100 p-3">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{metar.station_name}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">({metar.station_id})</span>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        <strong>Observation Time:</strong> {metar.observation_time}
      </div>

      <hr className="border-t border-gray-200 dark:border-gray-700 my-2" />

      <div className="pt-2">
        <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2.5 font-mono text-xs whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
          {metar.raw_text}
        </pre>
        
        {/* You can add more parsed METAR details here if your backend provides them */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div><strong>Flight Category:</strong> {metar.flight_category || 'N/A'}</div>
            <div><strong>Wind:</strong> {metar.wind_dir_degrees}° at {metar.wind_speed_kt}kt {metar.wind_gust_kt ? `gusting to ${metar.wind_gust_kt}kt` : ''}</div>
            <div><strong>Visibility:</strong> {metar.visibility_statute_mi || 'N/A'} sm</div>
            <div><strong>Temperature:</strong> {metar.temp_c}°C</div>
            <div><strong>Dewpoint:</strong> {metar.dewpoint_c}°C</div>
            <div><strong>Altimeter:</strong> {metar.altimeter_in_hg ? `${metar.altimeter_in_hg} inHg` : 'N/A'}</div>
            {metar.cloud_layers && metar.cloud_layers.length > 0 && (
                <div className="col-span-2">
                    <strong>Clouds:</strong>
                    <ul>
                        {metar.cloud_layers.map((cloud, idx) => (
                            <li key={idx}>{cloud.coverage} at {cloud.altitude_ft} ft</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MetarPopup;