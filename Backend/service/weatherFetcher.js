import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import Taf from '../models/taf.model.js';

const TAF_API_URL = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&stationString=~IN&hoursBeforeNow=12';

export async function updateTafs() {
  console.log('Starting TAF data update...');
  try {
    // Make the request with a User-Agent header
    const response = await axios.get(TAF_API_URL, {
      headers: {
        'User-Agent': 'VayuMetWeather/1.0 (contact@yourdomain.com)'
      }
    });

    // ... the rest of your parsing and database update logic remains the same
    const parsedData = await parseStringPromise(response.data);
    const tafReports = parsedData.response.data[0].TAF;

    if (!tafReports) {
      console.log('No new TAF reports found.');
      return;
    }

    for (const report of tafReports) {
      const filter = {
        station_id: report.station_id[0],
        issue_time: new Date(report.issue_time[0])
      };
      const updatePayload = {
        raw_text: report.raw_text[0],
        valid_time_from: new Date(report.valid_time_from[0]),
        valid_time_to: new Date(report.valid_time_to[0]),
      };
      await Taf.updateOne(filter, { $set: updatePayload }, { upsert: true });
    }

    console.log(`Successfully updated/inserted ${tafReports.length} TAF reports.`);

  } catch (error) {
    console.error('Error updating TAF data:', error.message);
  }
}