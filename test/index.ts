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

edis
  .getStations({ q: '593647aa-9fea-43ec-a7d6-6476a76ae868' })
  .subscribe((stations) => {
    // console.log(stations);
    if (stations.length > 0) {
      fetchCurrentDataFor(stations[0].getTimeSeries()[0], stations[0]);
      stations[0].getTimeSeries().forEach((ts) => {
        // console.log(ts);
        // ts.getTimeSeriesData('PT1H').subscribe((data) => {
        //   if (data.length) {
        //     console.log(
        //       `Data length: ${data.length} ### with start: ${
        //         data[0].timestamp
        //       } - end: ${data[data.length - 1].timestamp}`
        //     );
        //   } else {
        //     console.log(`No Data...`);
        //   }
        // });
        ts.getCharacteristicValues().subscribe((values) => {
          console.log(values);
        });
      });
      // ts.getCurrentTimeSeriesData().subscribe({
      //   next: (data) => {
      //     console.log(`${ts.name} get ${JSON.stringify(data)}`);
      //   },
      //   error: (err) => console.error(err),
      //   complete: () => console.log('Complete'),
      // });
      // });
    }
  });

edis
  .getStations({ q: 'c0ec139b-13b4-4f86-bee3-06665ad81a40' })
  .subscribe((stations) => {
    if (stations.length > 0) {
      const subscription = fetchCurrentDataFor(
        stations[0].getTimeSeries()[0],
        stations[0]
      );

      //       // setTimeout(() => {
      //       //   subscription.unsubscribe();
      //       //   console.log(`${new Date().toISOString()} - unsubscribe`);
      //       // }, 300000);
    }
  });
