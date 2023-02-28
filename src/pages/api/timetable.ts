import type { NextApiRequest, NextApiResponse } from 'next';
import { OebbTimetable } from '@/types/OebbTimetable';
import { decode } from 'html-entities';

type OebbFahrplan = {
  stationName: string;
  stationEvaId: string;
  journey: {
    id: string;
    ti: string;
    da: string;
    pr: string;
    st: string;
    lastStop: string;
    ati: string;
    tr?: string;
    rt:
      | {
          dlm: string;
          dlt: string;
          dld: string;
        }
      | false;
  }[];
};

const OEBB_FAHRPLAN_BASE_URL = 'https://fahrplan.oebb.at/bin/stboard.exe/dn';
const JSONP_CALLBACK = 'journeysObj = ';

const UTC_PLUS_ONE_OFFSET_HOURS = (new Date().getTimezoneOffset() + 60) / 60;

function parseDate(date: string, time: string) {
  const [day, month, year] = date.split('.');
  const [hour, minute] = time.split(':');

  return new Date(
    parseInt(year ?? '', 10),
    parseInt(month ?? '', 10) - 1,
    parseInt(day ?? '', 10),
    parseInt(hour ?? '', 10) - UTC_PLUS_ONE_OFFSET_HOURS,
    parseInt(minute ?? '', 10)
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OebbTimetable>
) {
  const { evaID } = req.query;

  if (typeof evaID !== 'string') {
    res.status(400).end();
    return;
  }

  const oebbFahrplanRequestURL = new URL(OEBB_FAHRPLAN_BASE_URL);

  oebbFahrplanRequestURL.searchParams.append('L', 'vs_scotty.vs_liveticker');
  oebbFahrplanRequestURL.searchParams.append('outputMode', 'tickerDataOnly');
  oebbFahrplanRequestURL.searchParams.append('start', 'yes');
  oebbFahrplanRequestURL.searchParams.append('evaId', evaID);

  oebbFahrplanRequestURL.searchParams.append('boardType', 'dep');

  try {
    const oebbFahrplanResponse = await fetch(oebbFahrplanRequestURL);
    const oebbFahrplanData = await oebbFahrplanResponse.text();

    const oebbFahrplan = JSON.parse(
      oebbFahrplanData.replace(JSONP_CALLBACK, '')
    ) as OebbFahrplan;

    const explicitOebbFahrplan = {
      journeys: oebbFahrplan.journey.map((journey) => ({
        dateISO: parseDate(journey.da, journey.ti).toISOString(),
        destinationStationName: decode(journey.st),
        id: journey.id,
        realtime: journey.rt
          ? {
              delayInMinutes: parseInt(journey.rt.dlm, 10),
              plannedDateISO: parseDate(
                journey.rt.dld,
                journey.rt.dlt
              ).toISOString(),
            }
          : undefined,
        transportation: journey.pr,
        transportationType: journey.pr.split(' ')[0] ?? 'what?',
      })),
      stationEvaID: oebbFahrplan.stationEvaId,
      stationName: oebbFahrplan.stationName,
    };
    res.status(200).json(explicitOebbFahrplan);
  } catch (error) {
    res.status(400).end();
  }
}
