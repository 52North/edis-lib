export interface DictStationQuery {
  station?: string;
  gewaesser?: string;
  agency?: string;
  land?: string;
  country?: string;
  einzugsgebiet?: string;
  kreis?: string;
  region?: string;
  parameter?: string;
  bbox?: string;
  q?: string;
}

export interface DictStation {
  uuid: string;
  number: string;
  shortname: string;
  longname: string;
  km: number;
  agency: string;
  longitude?: number;
  latitude?: number;
  country: string;
  land?: string;
  kreis?: string;
  einzugsgebiet?: string;
  mqtttopic: string;
  water: {
    shortname: string;
    longname: string;
  };
  timeseries: DictTimeseries[];
}

interface DictTimeseries {
  shortname: string;
  longname: string;
  unit: string;
  mqtttopic: string;
  pegelonlinelink: string;
  equidistance: number;
}
