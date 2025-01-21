import { PegelonlineEntity } from './pegelonline';

export interface MqttTimeseriesDataMessage {
  topic: string;
  timestamp: string;
  value: number;
}

export interface MqttTimeseriesResponse extends PegelonlineEntity {
  uuid: string;
  unit: string;
  equidistance: number;
  measurement: {
    timestamp: string;
    value: number;
  };
}

export interface MqttResponseEntry extends PegelonlineEntity {
  uuid: string;
  number: string;
  state: string;
  region: string;
  agency: string;
  water: { shortName: string };
  timeseries: MqttTimeseriesResponse;
}
