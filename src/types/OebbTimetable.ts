export type OebbTimetable = {
  stationName: string;
  stationEvaID: string;
  journeys: {
    id: string;
    dateISO: string;
    transportation: string;
    transportationType: string;
    destinationStationName: string;
    realtime?: {
      delayInMinutes: number;
      plannedDateISO: string;
    };
  }[];
};
