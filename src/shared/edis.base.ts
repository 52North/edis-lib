import axios from 'axios';
import { IClientOptions } from 'mqtt';
import { from, map, Observable } from 'rxjs';

import { DICT_URL, PEGELONLINE_URL } from './consts';
import { DictStation, DictStationQuery } from './models/dict';
import { PegelonlineStation } from './models/pegelonline';
import { MqttEdisClient } from './mqttEdisClient';
import { Station, StationConfig, TimeSeries } from './station';

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

export abstract class EdisBase {
  private client: MqttEdisClient;
  private config: EdisProperties;
  constructor(
    private props: EdisProperties,
    protected mqttClientOptions: IClientOptions
  ) {
    this.config = {
      dictApiUrl: this.props.dictApiUrl ? this.props.dictApiUrl : DICT_URL,
      pegelonlineUrl: this.props.pegelonlineUrl
        ? this.props.pegelonlineUrl
        : PEGELONLINE_URL,
      mqttCredentials: this.props.mqttCredentials,
    };
    if (this.props.mqttHost) {
      mqttClientOptions.hostname = this.props.mqttHost;
    }
    this.client = new MqttEdisClient(mqttClientOptions);
  }

  setAccessToken(accessToken: string) {
    this.client.setAccessToken(accessToken);
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
                pegelonlineUrl: this.config.pegelonlineUrl,
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
    const url = `${this.config.pegelonlineUrl}/stations/${id}?includeTimeseries=true`;
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
              pegelonlineUrl: this.config.pegelonlineUrl,
            })
        );
        return new Station({ ...stationConf, timeseries });
      })
    );
  }

  private createDictApiSearchUrl(query: DictStationQuery) {
    return `${this.config.dictApiUrl}/search?${new URLSearchParams(
      Object.entries(query)
    )}`;
  }
}
