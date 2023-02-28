import { OebbDirection } from '@/types/OebbDirection';
import { OebbDirectionTable } from '@/components/OebbDirectionTable';
import { OebbTimetable } from '@/types/OebbTimetable';
import { Refresh } from '@/components/Refresh';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    evaID: string;
  };
};

export default async function Page({ params: { evaID } }: PageProps) {
  const res = await fetch(
    `http://localhost:3000/api/timetable?evaID=${evaID}`,
    { cache: 'no-cache' }
  );

  if (!res.ok) {
    notFound();
  }

  const timetable = (await res.json()) as OebbTimetable;

  const directions = new Map<string, OebbDirection>();
  const now = new Date();

  for (const {
    dateISO,
    destinationStationName,
    realtime,
    transportation,
    transportationType,
  } of timetable.journeys) {
    const date = new Date(dateISO);
    const realtimeDate = realtime ? new Date(realtime.plannedDateISO) : null;

    if ((realtimeDate ?? date) < now) continue;

    const key = `${timetable.stationName}-${destinationStationName}-${transportationType}`;

    const direction =
      directions.get(key) ??
      ({
        endStationName: destinationStationName,
        key,
        nextDepartures: [],
        stationEvaID: timetable.stationEvaID,
        stationName: timetable.stationName,
        transportation,
        transportationType,
      } satisfies OebbDirection);

    direction.nextDepartures.push({
      dateISO: realtimeDate?.toISOString() ?? date.toISOString(),
      initialDateISO: realtimeDate ? date.toISOString() : undefined,
    });

    directions.set(key, direction);
  }

  const directionTable = Array.from(directions.values()).map((direction) => ({
    ...direction,
    nextDepartures: direction.nextDepartures
      .sort(
        (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
      )
      .slice(0, 3),
  }));

  return (
    <>
      <Refresh minutes={1} />
      <OebbDirectionTable directions={directionTable} />
      <pre>{JSON.stringify(timetable, null, 2)}</pre>
    </>
  );
}
