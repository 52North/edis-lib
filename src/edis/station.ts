import axios from 'axios';
import { from, map, Observable } from 'rxjs';

import {
  PegelonlineCharacteristicValues,
  PegelonlineTimeseries,
} from './models/pegelonline';
import { MqttEdisClient } from './mqttEdisClient';

export interface TimeValuePair {
  timestamp: string;
  value: number;
}

export interface StationConfig {
  readonly id: string;
  readonly shortname: string;
  readonly longname: string;
  readonly km: number;
  readonly agency: string;
  readonly water: {
    shortname: string;
    longname: string;
  };
  readonly timeseries?: TimeSeries[];
  readonly longitude?: number;
  readonly latitude?: number;
  readonly country?: string;
  readonly land?: string;
  readonly kreis?: string;
  readonly einzugsgebiet?: string;
}

export class Station {
  readonly id: string;
  readonly shortname: string;
  readonly longname: string;
  readonly km: number;
  readonly agency: string;
  readonly water: {
    shortname: string;
    longname: string;
  };
  readonly timeseries?: TimeSeries[];
  readonly longitude?: number;
  readonly latitude?: number;
  readonly country?: string;
  readonly land?: string;
  readonly kreis?: string;
  readonly einzugsgebiet?: string;

  constructor(config: StationConfig) {
    this.id = config.id;
    this.shortname = config.shortname;
    this.longname = config.longname;
    this.km = config.km;
    this.agency = config.agency;
    this.water = config.water;
    this.timeseries = config.timeseries;
    this.longitude = config.longitude;
    this.latitude = config.latitude;
    this.country = config.country;
    this.land = config.land;
    this.kreis = config.kreis;
    this.einzugsgebiet = config.einzugsgebiet;
  }

  getTimeSeries() {
    return this.timeseries;
  }
}

export class TimeSeriesConfig {
  readonly name: string;
  readonly shortname: string;
  readonly unit: string;
  readonly equidistance: number;
  readonly station: Station;
  client: MqttEdisClient;
  pegelonlineUrl: string;
}

export class TimeSeries {
  readonly name: string;
  readonly shortname: string;
  readonly unit: string;
  readonly equidistance: number;
  readonly station: Station;

  #client: MqttEdisClient;
  #pegelonlineUrl: string;

  constructor(config: TimeSeriesConfig) {
    this.#client = config.client;
    this.#pegelonlineUrl = config.pegelonlineUrl;
    this.name = config.name;
    this.shortname = config.shortname;
    this.unit = config.unit;
    this.equidistance = config.equidistance;
    this.station = config.station;
  }

  getTimeSeriesData(timespan: Timespan): Observable<TimeSeriesData[]> {
    const serviceUrl = this.#pegelonlineUrl;
    const timeParams = this.createTimeparam(timespan);
    const params = new URLSearchParams(timeParams).toString();
    const url = `${serviceUrl}/stations/${this.station.id}/${this.shortname}/measurements.json?${params}`;
    const request = axios.get<TimeValuePair[]>(url);
    return from(request).pipe(
      map((rs) =>
        rs.data.map((e) => ({
          timestamp: e.timestamp,
          value: e.value,
        }))
      )
    );
  }

  getCurrentTimeSeriesData(): Observable<TimeSeriesData> {
    return this.#client.subscribeTopic(
      this.station.id,
      this.shortname.toLocaleLowerCase()
    );
  }

  getCharacteristicValues(): Observable<PegelonlineCharacteristicValues[]> {
    const serviceUrl = this.#pegelonlineUrl;
    const url = `${serviceUrl}/stations/${this.station.id}/${this.shortname}.json?includeCharacteristicValues=true`;
    const request = axios.get<PegelonlineTimeseries>(url);
    return from(request).pipe(map((rs) => rs.data.characteristicValues));
  }

  private createTimeparam(timespan: Timespan) {
    if (
      (timespan as FlexibleTimespan).start &&
      (timespan as FlexibleTimespan).end
    ) {
      const flexibleTs = timespan as FlexibleTimespan;
      return {
        start: flexibleTs.start.toISOString(),
        end: flexibleTs.end.toISOString(),
      };
    } else if (typeof timespan === 'string') {
      return { start: timespan };
    }
    throw new Error('Could not prepare timespan');
  }
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export type Timespan = FlexibleTimespan | string;
export interface FlexibleTimespan {
  start: Date;
  end: Date;
}
