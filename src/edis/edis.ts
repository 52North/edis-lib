import { IClientOptions } from 'mqtt';
import { DictStation, DictStationQuery } from './models/dict';
import axios from 'axios';

import {
  DEFAULT_DICT_URL,
  DEFAULT_PEGELONLINE_URL,
  MQTT_BASE_CONFIG,
  WEBSOCKET_BASE_CONFIG,
} from './constants';
import { MqttEdisClient } from './mqttEdisClient';
import { Station, StationConfig, TimeSeries } from './station';
import { catchError, from, map, Observable } from 'rxjs';
import { PegelonlineStation } from './models/pegelonline';

export interface EdisProperties {
  usedInBrowser: boolean;
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
  /**
   * mqtt host url
   */
  mqttHost?: string;
}

export interface MqttCredentials {
  /**
   * username for the mqtt client connection
   */
  username?: string;
  /**
   * password for the mqtt client connection
   */
  password: string;
}

export type StationQuery = DictStationQuery;

/**
 * Entry point to use this library. An instance of this class initializes a mqtt client to subscribe to current timeseries data.
 */
export class Edis {
  private client: MqttEdisClient;
  private pegelonlineUrl: string;
  private dictApiUrl: string;

  constructor(protected properties: EdisProperties = { usedInBrowser: true }) {
    let config: IClientOptions;
    if (properties.usedInBrowser) {
      config = WEBSOCKET_BASE_CONFIG;
    } else {
      config = MQTT_BASE_CONFIG;
    }
    if (properties.mqttCredentials) {
      config.username = properties.mqttCredentials.username;
      config.password = properties.mqttCredentials.password;
    }
    if (properties.mqttHost) {
      config.hostname = properties.mqttHost;
    }
    this.client = new MqttEdisClient(config);
    this.pegelonlineUrl = properties.pegelonlineUrl
      ? properties.pegelonlineUrl
      : DEFAULT_PEGELONLINE_URL;
    this.dictApiUrl = properties.dictApiUrl
      ? properties.dictApiUrl
      : DEFAULT_DICT_URL;
  }

  /**
   * Get all stations of pegelonline, which fits the given query.
   *
   * @returns Observable of Stations in an array.
   */
  getStations(query: StationQuery = {}): Observable<Station[]> {
    const request = axios.get<{ stations: DictStation[] }>(
      this.createDictApiSearchUrl(query)
    );
    return from(request).pipe(
      map((res) =>
        res.data.stations.map((entry) => {
          const stationConf: StationConfig = {
            id: entry.uuid,
            shortname: entry.shortname,
            longname: entry.longname,
            km: entry.km,
            agency: entry.agency,
            water: entry.water,
            longitude: entry.longitude,
            latitude: entry.latitude,
            country: entry.country,
            land: entry.land,
            kreis: entry.kreis,
            einzugsgebiet: entry.einzugsgebiet,
          };
          const timeseries = entry.timeseries.map(
            (ts) =>
              new TimeSeries({
                name: ts.longname,
                shortname: ts.shortname,
                unit: ts.unit,
                equidistance: ts.equidistance,
                station: new Station(stationConf),
                client: this.client,
                pegelonlineUrl: this.pegelonlineUrl,
              })
          );
          return new Station({
            ...stationConf,
            timeseries,
          });
        })
      )
    );
  }

  getStation(id: string): Observable<Station> {
    const url = `${this.pegelonlineUrl}/stations/${id}?includeTimeseries=true`;
    const request = axios.get<PegelonlineStation>(url);
    return from(request).pipe(
      map((res) => {
        const st = res.data;
        const stationConf: StationConfig = {
          id: st.uuid,
          shortname: st.shortname,
          longname: st.longname,
          km: st.km,
          agency: st.agency,
          water: st.water,
          longitude: st.longitude,
          latitude: st.latitude,
        };
        const timeseries = st.timeseries.map(
          (ts) =>
            new TimeSeries({
              name: ts.longname,
              shortname: ts.shortname,
              unit: ts.unit,
              equidistance: ts.equidistance,
              station: new Station(stationConf),
              client: this.client,
              pegelonlineUrl: this.pegelonlineUrl,
            })
        );
        return new Station({ ...stationConf, timeseries });
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      })
    );
  }

  private createDictApiSearchUrl(query: DictStationQuery) {
    return `${this.dictApiUrl}/search?${new URLSearchParams(
      Object.entries(query)
    )}`;
  }
}
