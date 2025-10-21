import React from 'react';
import './TafPopup.css';

const TafPopup = ({ taf }) => {
  if (!taf) return null; // Don't render anything if there's no TAF data

  return (
    <div className="taf-popup-card">
      <div className="taf-popup-header">
        <span className="station-name">{taf.station_name}</span>
        <span className="station-id">({taf.station_id})</span>
      </div>

      <div className="valid-time">
        <strong>Valid:</strong> {taf.valid_from} to {taf.valid_to}
      </div>

      <hr className="separator" />

      <div className="taf-popup-content">
        <pre className="raw-text">{taf.raw_text}</pre>

        {taf.forecasts && taf.forecasts.length > 0 && (
          <>
            <h5 className="forecast-title">Forecast Details</h5>

            {/* Scrollable container */}
            <div className="table-container">
              <table className="taf-forecast-table">
                <thead>
                  <tr>
                    <th>Time From</th>
                    <th>Time To</th>
                    <th>Change</th>
                    <th>Wind (kt)</th>
                    <th>Visibility</th>
                    <th>Weather</th>
                    <th>Sky Cond. (ft)</th>
                  </tr>
                </thead>
                <tbody>
                  {taf.forecasts.map((fc, index) => (
                    <tr key={index}>
                      <td>{fc.time_from}</td>
                      <td>{fc.time_to}</td>
                      <td>{fc.change_indicator}</td>
                      <td>{fc.wind}</td>
                      <td>{fc.visibility}</td>
                      <td>{fc.weather}</td>
                      <td dangerouslySetInnerHTML={{ __html: fc.sky_condition }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TafPopup;
