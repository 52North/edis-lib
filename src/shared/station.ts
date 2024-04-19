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

export class Station {
  constructor(
    readonly id: string,
    readonly shortname: string,
    readonly longname: string,
    readonly km: number,
    readonly agency: string,
    readonly country: string,
    readonly water: {
      shortname: string;
      longname: string;
    },
    private timeseries: TimeSeries[],
    readonly longitude?: number,
    readonly latitude?: number,
    readonly land?: string,
    readonly kreis?: string,
    readonly einzugsgebiet?: string
  ) {}

  getTimeSeries() {
    return this.timeseries;
  }
}

export class TimeSeries {
  constructor(
    readonly name: string,
    readonly shortname: string,
    readonly unit: string,
    private readonly station: Station,
    private readonly pegelonlineUrl: string,
    private client: MqttEdisClient
  ) {}

  getTimeSeriesData(timespan: Timespan): Observable<TimeSeriesData[]> {
    const serviceUrl = this.pegelonlineUrl;
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
    const topicId = `${this.station.id}/${this.shortname.toLowerCase()}`;
    return this.client.subscribeTopic(topicId);
  }

  getCharacteristicValues(): Observable<PegelonlineCharacteristicValues[]> {
    const serviceUrl = this.pegelonlineUrl;
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
