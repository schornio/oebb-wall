import { OebbDirectionDeparture } from './OebbDirectionDeparture';

export type OebbDirection = {
  key: string;
  stationName: string;
  stationEvaID: string;
  endStationName: string;
  nextDepartures: OebbDirectionDeparture[];
  transportation: string;
  transportationType: string;
};
