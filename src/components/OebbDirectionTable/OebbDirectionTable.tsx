import { DepatureInMinutes } from '../DepatureInMinutes';
import { Fragment } from 'react';
import { OebbDirection } from '@/types/OebbDirection';
import styles from './OebbDirectionTable.module.css';

// As long display: contents is not supported (correctly) by all browsers, we need to use grid on divs instead of a sematic table
export function OebbDirectionTable({
  directions,
}: {
  directions: OebbDirection[];
}) {
  return (
    <div className={styles.table}>
      {directions.map((direction) => (
        <Fragment key={direction.key}>
          <div>{direction.stationName}</div>
          <div>{direction.endStationName}</div>
          <div>{direction.transportationType}</div>
          <div>
            <DepatureInMinutes departure={direction.nextDepartures[0]} />
          </div>
          <div>
            <DepatureInMinutes departure={direction.nextDepartures[1]} />
          </div>
          <div>
            <DepatureInMinutes departure={direction.nextDepartures[2]} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}
