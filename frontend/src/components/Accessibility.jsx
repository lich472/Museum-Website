import React, { useEffect, useState } from 'react';
import { DEFAULT_VISITOR_INFO } from '../data/visitorInfo';
import { apiFetch } from '../api/client';

function Accessibility() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/visitor-info')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setInfo(json.data ?? json))
      .catch((err) => {
        console.warn(`[accessibility] using bundled visitor info: ${err.message}`);
        setInfo(DEFAULT_VISITOR_INFO);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-10 text-center">⏳ Loading…</div>;
  if (!info) {
    return <div className="py-10 text-center text-red-700">No data available.</div>;
  }

  // A section that arrives empty must not replace the curated copy. The boolean
  // is taken as given, because `false` is a legitimate answer.
  const apiAcc = info.accessibility || {};
  const acc = {
    wheelchairAccess:
      apiAcc.wheelchairAccess ?? DEFAULT_VISITOR_INFO.accessibility.wheelchairAccess,
    parking: apiAcc.parking || DEFAULT_VISITOR_INFO.accessibility.parking,
    sensoryFriendlyHours:
      apiAcc.sensoryFriendlyHours ||
      DEFAULT_VISITOR_INFO.accessibility.sensoryFriendlyHours,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Accessibility</h2>
        <p className="text-slate-600">Information to help you plan a comfortable visit.</p>
      </div>

      <section aria-labelledby="key-info-heading" className="space-y-3">
        <h3 id="key-info-heading" className="text-xl font-semibold">Key Information</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Wheelchair Access"
            available={acc.wheelchairAccess}
            detail={
              acc.wheelchairAccess
                ? 'Step-free entry via the main entrance. All four galleries are wheelchair accessible.'
                : 'Please contact us in advance to discuss access arrangements.'
            }
          />
          <InfoCard title="Accessible Parking" detail={acc.parking} />
          <InfoCard title="Sensory-Friendly Hours" detail={acc.sensoryFriendlyHours} />
        </div>
        <p className="text-sm text-slate-600">
          Accessibility points inside the building are marked on the{' '}
          <a className="text-blue-700 underline" href="#facilities">
            ground floor map
          </a>
          .
        </p>
      </section>

      <section
        aria-labelledby="commitment-heading"
        className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-6"
      >
        <h3 id="commitment-heading" className="text-xl font-semibold">
          Our Accessibility Commitment
        </h3>

        <p>
          We are working towards WCAG 2.2 Level AA across this website. That is a
          target we are still measuring ourselves against — it is not a
          certification, and no independent audit has been carried out yet.
        </p>

        <p>What we have addressed so far:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            A “skip to main content” link, so keyboard users can bypass the
            navigation.
          </li>
          <li>
            Contrast fixes on the floor map, the numbered facility badges and the
            error messages on the events pages.
          </li>
          <li>
            The floor map is keyboard operable, and every room and marker is
            announced to screen readers rather than being flattened into one
            image.
          </li>
          <li>
            The language menu marks each option with its own language, so a
            screen reader does not read “中文” with English pronunciation.
          </li>
        </ul>

        <p>Known gaps we have not closed yet:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            No automated audit (axe or Lighthouse) and no full screen-reader
            walkthrough has been run, so this list is not exhaustive.
          </li>
          <li>
            The floor plan is drawn as SVG, so its labels do not scale as
            predictably as HTML text at high zoom levels.
          </li>
          <li>
            Chinese wording is produced by Google Translate, not written by us,
            and machine translation is not always accurate.
          </li>
        </ul>

        <p>
          If you meet a barrier, please tell us — ask at the front desk, or email{' '}
          {/* TODO: replace with the museum's real accessibility contact. */}
          <a className="text-blue-700 underline" href="mailto:access@example.org">
            access@example.org
          </a>{' '}
          — and we will help you directly and fix the cause.
        </p>
      </section>
    </div>
  );
}

function InfoCard({ title, detail, available }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {available !== undefined && (
          <span aria-hidden="true">{available ? '✅' : '⚠️'}</span>
        )}
        <h4 className="text-base font-semibold">{title}</h4>
        {available !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {available ? 'Available' : 'Limited'}
          </span>
        )}
      </div>
      <p className="text-slate-700">{detail}</p>
    </div>
  );
}

export default Accessibility;