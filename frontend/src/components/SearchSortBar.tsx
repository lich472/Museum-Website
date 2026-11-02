import { useId } from 'react';
import type { SortOrder } from '../hooks/useSearchSort';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  order: SortOrder;
  onOrderChange: (value: SortOrder) => void;
  label: string;
  resultCount: number;
  totalCount: number;
}

const fieldClass =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-base ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700';

export default function SearchSortBar({
  query,
  onQueryChange,
  order,
  onOrderChange,
  label,
  resultCount,
  totalCount,
}: Props) {
  const uid = useId();
  const searching = query.trim().length > 0;

  return (
    <div className="mb-6">
      <div role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-md sm:flex-1">
          <div className="flex gap-2">
            <input
              id={`${uid}-search`}
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={`Search ${label}…`}
              autoComplete="off"
              className={`${fieldClass} w-full`}
            />
            {searching && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          <select
            id={`${uid}-sort`}
            value={order}
            onChange={(e) => onOrderChange(e.target.value as SortOrder)}
            className={`${fieldClass} w-full sm:w-auto`}
          >
            <option value="newest">Newest → Oldest</option>
            <option value="oldest">Oldest → Newest</option>
          </select>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-2 text-sm text-slate-600">
        {resultCount === 0
          ? `No ${label} match “${query.trim()}”.`
          : searching
            ? `Showing ${resultCount} of ${totalCount} ${label}.`
            : `${totalCount} ${label}.`}
      </p>
    </div>
  );
}