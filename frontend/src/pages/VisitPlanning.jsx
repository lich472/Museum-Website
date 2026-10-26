import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { DEFAULT_VISITOR_INFO } from '../data/visitorInfo';
import usePageTitle from '../utils/usePageTitle';
import Facilities from '../components/Facilities';
import Accessibility from '../components/Accessibility';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const SECTIONS = [
  { id: 'hours', label: 'Hours & Location', tint: 'bg-sky-50' },
  { id: 'facilities', label: 'Facilities', tint: 'bg-amber-50' },
  { id: 'accessibility', label: 'Accessibility', tint: 'bg-emerald-50' },
];

const linkClass = (active) =>
  `block whitespace-nowrap px-3 py-2 text-sm
   border-b-4 lg:-ml-[2px] lg:border-b-0 lg:border-l-4 lg:rounded-r-md rounded-t-md
   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700
   ${
     active
       ? 'border-slate-800 bg-slate-100 font-semibold text-slate-900'
       : 'border-transparent text-slate-700 hover:bg-slate-100'
   }`;

const sectionClass = (isActive, tint) =>
  `scroll-mt-24 rounded-xl p-6 transition-colors duration-300 motion-reduce:transition-none ${
    isActive ? tint : 'bg-transparent'
  }`;

export default function VisitPlanning() {
  usePageTitle('Plan your visit');
  const [info, setInfo] = useState(null);
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    apiFetch('/visitor-info')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setInfo(json.data ?? json))
      .catch(() => setInfo(DEFAULT_VISITOR_INFO));
  }, []);

  useEffect(() => {
    if (!info) return undefined;

    const update = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      if (atBottom) {
        setActive(SECTIONS[SECTIONS.length - 1].id);
        return;
      }
      let current = SECTIONS[0].id;
      SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      });
      setActive(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [info]);

  if (!info) return <p className="py-10 text-center">Loading…</p>;

  const hours = info.openingHours ?? {};
  const location = info.location ?? {};
  const mapsUrl =
    location.lat != null && location.lng != null
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : null;

  const tintFor = (id) => SECTIONS.find((s) => s.id === id).tint;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-6xl px-4 py-8 outline-none lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8"
    >
      <aside className="mb-8 lg:mb-0">
        <nav aria-label="On this page" className="lg:sticky lg:top-24">
          <p className="mb-2 hidden text-xs font-semibold uppercase tracking-wide text-slate-600 lg:block">
            On this page
          </p>
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible lg:border-l-2 lg:border-slate-200">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'location' : undefined}
                  className={linkClass(active === id)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 space-y-6">
        <h1 className="text-3xl font-bold">Plan Your Visit</h1>

        <section
          id="hours"
          aria-labelledby="hours-heading"
          className={`${sectionClass(active === 'hours', tintFor('hours'))} space-y-8`}
        >
          <div>
            <h2 id="hours-heading" className="mb-3 text-2xl font-semibold">Opening Hours</h2>
            <dl className="max-w-sm">
              {DAYS.map((day) => (
                <div key={day} className="flex justify-between border-b border-slate-200 py-1">
                  <dt className="capitalize">{day}</dt>
                  <dd>{hours[day] ?? 'See front desk'}</dd>
                </div>
              ))}
            </dl>
            {hours.closedDates?.length > 0 && (
              <p className="mt-3 text-sm text-slate-600">
                Closed on: {hours.closedDates.join(', ')}
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold">Getting Here</h2>
            <p>{location.address ?? 'Address coming soon.'}</p>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-700 underline"
              >
                Open in Google Maps
              </a>
            )}
          </div>
        </section>

        <section id="facilities" className={sectionClass(active === 'facilities', tintFor('facilities'))}>
          <Facilities />
        </section>

        <section id="accessibility" className={sectionClass(active === 'accessibility', tintFor('accessibility'))}>
          <Accessibility />
        </section>
      </div>
    </main>
  );
}