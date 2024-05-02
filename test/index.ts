import fs from 'fs';

import { Edis } from '../src/node';
import { MqttCredentials, Station, TimeSeries } from '../src/shared';

const credentials = JSON.parse(
  fs.readFileSync('test/credentials.json', 'utf8')
) as MqttCredentials;

function fetchCurrentDataFor(ts: TimeSeries | undefined, station: Station) {
  if (ts) {
    return ts.getCurrentTimeSeriesData().subscribe({
      next: (data) =>
        console.log(
          `${new Date().toISOString()} - ${station.id}/${ts.shortname} - ${
            data.value
          } at ${data.timestamp}`
        ),
      error: (err) => console.error(err),
      complete: () => console.log('Complete'),
    });
  }
  return undefined;
}

const edis = new Edis({
  dictApiUrl: 'http://localhost:3000',
  mqttCredentials: credentials,
});

edis.getStation('593647aa-9fea-43ec-a7d6-6476a76ae868').subscribe((station) => {
  console.log(station);
  station.getTimeSeries().forEach((ts) => {
    console.log(ts);
  });
});

edis.getStations({ q: 'helgoland binnen' }).subscribe((stations) => {
  stations.forEach((station) => console.log(station.longname));
  const station = stations[0];
  if (station) {
    station.getTimeSeries().forEach((ts) => {
      console.log(ts);
      fetchCurrentDataFor(ts, station);
      ts.getCharacteristicValues().subscribe((values) => console.log(values));
    });
  }
});
