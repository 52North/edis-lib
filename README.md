# edis-lib

Library to consume the DICT-API and the [Pegelonline REST-API](https://www.pegelonline.wsv.de/webservice/guideRestapi)

## Build libs

To get a packaged build of the edis lib use `pnpm build`.

[Getting started with the lib](./HowTo.md)

**Entwickelt im Auftrag des ITZ Bund**

<!-- ``` typescript
const edis = new Edis({
    dictApiUrl: 'http://localhost:3000', // optional, example is for local development
    mqttCredentials: {
        username: '...', // needed for a secured mqtt broker
        password: '...', // needed for a secured mqtt broker
    },
});

// request all stations
edis.getStations().subscribe({
    next: (stations) => {      
        if (stations.length >= 1) {
            // select the first station of the list
            const station = stations[0];
            // get all timeseries of the station
            const ts = station.getTimeSeries();
            if (ts.length >= 1) {
                // get first timeseries
                const timeseries = ts[0];
                // get timeseriesData for the last 10 hours
                timeseries.getTimeSeriesData('PT10H').subscribe((data) => console.log(data));
                // get characteristicValues for the given timeseries
                timeseries.getCharacteristicValues().subscribe((values) => console.log(values));
                // get current timeseries data by internally subscribing to the corresponding mqtt topic for this time series
                timeseries.getCurrentTimeSeriesData().subscribe((data) => console.log(data));
            }
        }
    },
});
``` -->
