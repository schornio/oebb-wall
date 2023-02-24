'use client';

import { useEffect } from 'react';

export function Refresh({ minutes }: { minutes: number }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.reload();
    }, minutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [minutes]);
  return null;
}
