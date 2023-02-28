import { useEffect, useState } from 'react';
import { OebbDirectionDeparture } from '@/types/OebbDirectionDeparture';

export function DepatureInMinutes({
  departure,
}: {
  departure?: OebbDirectionDeparture;
}) {
  const [now, setNow] = useState(new Date());
  const depatureDate = departure?.dateISO ? new Date(departure.dateISO) : null;

  useEffect(() => {
    if (!departure?.dateISO) {
      return () => {
        /* noop */
      };
    }

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [departure?.dateISO]);

  return (
    <>
      {depatureDate
        ? Math.max(
            0,
            Math.floor((depatureDate.getTime() - now.getTime()) / 60000)
          )
        : null}
    </>
  );
}
