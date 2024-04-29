import axios from 'axios';
import { IClientOptions } from 'mqtt';
import { from, map, Observable } from 'rxjs';

import { DICT_URL, PEGELONLINE_URL } from './consts';
import { DictStation, DictStationQuery } from './models/dict';
import { PegelonlineStation } from './models/pegelonline';
import { MqttEdisClient } from './mqttEdisClient';
import { Station, TimeSeries } from './station';

export interface EdisProperties {
  /**
   * optional url to the dict api endpoint
   */
  dictApiUrl?: string;
  /**
   * optional url to the pegelonline api endpoint
   */
  pegelonlineUrl?: string;
  /**
   * optional credentials for the mqtt client connection
   */
  mqttCredentials?: MqttCredentials;
}

export interface MqttCredentials {
  /**
   * username for the mqtt client connection
   */
  username: string;
  /**
   * password for the mqtt client connection
   */
  password: string;
}

export abstract class EdisBase {
  private client: MqttEdisClient;
  private config: EdisProperties;
  constructor(
    private props: EdisProperties,
    protected mqttClientOptions: IClientOptions
  ) {
    this.config = {
      dictApiUrl: props.dictApiUrl ? props.dictApiUrl : DICT_URL,
      pegelonlineUrl: props.pegelonlineUrl
        ? props.pegelonlineUrl
        : PEGELONLINE_URL,
      mqttCredentials: props.mqttCredentials,
    };
    this.client = new MqttEdisClient(mqttClientOptions);
  }

  /**
   * Get all stations of pegelonline, which fits the given query.
   *
   * @returns Observable of Stations in an array.
   */
  getStations(query: DictStationQuery = {}): Observable<Station[]> {
    const request = axios.get<{ stations: DictStation[] }>(
      this.createDictApiSearchUrl(query)
    );
    return from(request).pipe(
      map((res) =>
        res.data.stations.map((entry) => {
          const timeseries: TimeSeries[] = [];
          const station = new Station(
            entry.uuid,
            entry.shortname,
            entry.longname,
            entry.km,
            entry.agency,
            entry.water,
            timeseries,
            entry.longitude,
            entry.latitude,
            entry.country,
            entry.land,
            entry.kreis,
            entry.einzugsgebiet
          );
          entry.timeseries.forEach((ts) =>
            timeseries.push(
              new TimeSeries(
                ts.longname,
                ts.shortname,
                ts.unit,
                station,
                this.config.pegelonlineUrl,
                this.client
              )
            )
          );
          return station;
        })
      )
    );
  }

  getStation(id: string): Observable<Station> {
    const url = `${this.config.pegelonlineUrl}/stations/${id}?includeTimeseries=true`;
    const request = axios.get<PegelonlineStation>(url);
    return from(request).pipe(
      map((res) => {
        const timeseries: TimeSeries[] = [];
        const st = res.data;
        const station = new Station(
          st.uuid,
          st.shortname,
          st.longname,
          st.km,
          st.agency,
          st.water,
          timeseries,
          st.longitude,
          st.latitude
        );
        st.timeseries.forEach((ts) => {
          timeseries.push(
            new TimeSeries(
              ts.longname,
              ts.shortname,
              ts.unit,
              station,
              this.config.pegelonlineUrl,
              this.client
            )
          );
        });
        return station;
      })
    );
  }

  private createDictApiSearchUrl(query: DictStationQuery) {
    return `${this.config.dictApiUrl}/search?${new URLSearchParams(
      Object.entries(query)
    )}`;
  }
}
