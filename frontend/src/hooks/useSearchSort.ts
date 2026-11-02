import { useMemo, useState } from 'react';

export type SortOrder = 'newest' | 'oldest';

interface Options<T> {
  getSearchText: (item: T) => string;
  getDate: (item: T) => string | number | Date | null | undefined;
  defaultOrder?: SortOrder;
}

const normalise = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const toTime = (value: string | number | Date | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  // A bare year (e.g. 1850) must not be read as milliseconds since 1970.
  if (typeof value === 'number' && value > 0 && value < 10000) {
    return new Date(value, 0, 1).getTime();
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export function useSearchSort<T>(
  items: T[],
  { getSearchText, getDate, defaultOrder = 'newest' }: Options<T>
) {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<SortOrder>(defaultOrder);

  const results = useMemo(() => {
    const terms = normalise(query).split(/\s+/).filter(Boolean);

    // Every word typed must appear somewhere in the item.
    const filtered = terms.length
      ? items.filter((item) => {
          const text = normalise(getSearchText(item));
          return terms.every((term) => text.includes(term));
        })
      : items;

    return [...filtered].sort((a, b) => {
      const ta = toTime(getDate(a));
      const tb = toTime(getDate(b));
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return order === 'newest' ? tb - ta : ta - tb;
    });
  }, [items, query, order, getSearchText, getDate]);

  return { query, setQuery, order, setOrder, results };
}