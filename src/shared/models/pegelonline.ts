export interface PegelonlineEntity {
  shortname: string;
  longname: string;
}

export interface PegelonlineCharacteristicValues extends PegelonlineEntity {
  unit: string;
  value: number;
  validFrom?: string;
  occurences?: string;
  timespanStart?: string;
  timespanEnd?: string;
}

export interface PegelonlineTimeseries extends PegelonlineEntity {
  unit: string;
  equidistance: number;
  characteristicValues: PegelonlineCharacteristicValues[];
}
