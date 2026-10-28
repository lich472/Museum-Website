import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { IEvent } from "../types";
import RichText from "../components/RichText";

const badgeStyles: Record<string, string> = {
  workshop: "bg-blue-100 text-blue-800",
  talk: "bg-purple-100 text-purple-800",
  tour: "bg-green-100 text-green-800",
};

// Formats the date part: e.g., "Monday, 26 October 2026"
const fmt = (d: string | Date) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Formats the time part: e.g., "9:34 PM"
const fmtTime = (d: string | Date) =>
  new Date(d).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<LoadError | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  // The event's own name once it loads; the placeholder covers the fetch and
  // the missing/unavailable states.
  usePageTitle(event ? event.title : "Event");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<{ event: IEvent } | IEvent>(`/events/${id}`);
        setEvent("event" in response.data ? response.data.event : response.data);
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setEvent(null);
        // "Not found" is reserved for a 404; any other failure is retryable and
        // must not claim the event does not exist.
        setError(isNotFound(err) ? "not-found" : "failed");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id, attempt]);

  if (loading) {
    return (
      <main className="loading" style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Loading details...</h1>
      </main>
    );
  }

  if (error === "failed") {
    return (
      <main className="state-error" role="alert">
        <h1>Event Unavailable</h1>
        <p>We couldn't load this event right now. Please try again.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => setAttempt((current) => current + 1)}
        >
          Try again
        </button>
        <p>
          <Link to="/events">← Back to events</Link>
        </p>
      </main>
    );
  }

  if (error === "not-found" || !event) {
    return (
      <main className="not-found">
        <h1>Event not found</h1>
        <Link to="/events">← Back to events</Link>
      </main>
    );
  }

  const sameDay =
    new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString();

  // Displays "Date, Start Time – End Time" if single day, otherwise "Start Date, Time – End Date, Time"
  const dateText = sameDay
    ? `${fmt(event.startDate)} @ ${fmtTime(event.startDate)} – ${fmtTime(event.endDate)}`
    : `${fmt(event.startDate)} (${fmtTime(event.startDate)}) – ${fmt(event.endDate)} (${fmtTime(event.endDate)})`;

  const data = event as IEvent & { spotsRemaining?: number; id?: string | number };
  const spotsLeft = event.spotRemaining ?? event.capacity;
  const soldOut = spotsLeft <= 0;
  const spotsColor = soldOut
    ? "text-red-600"
    : spotsLeft <= 5
    ? "text-orange-500"
    : "text-green-600";

  return (
    <main>
      <section className="detail-hero">
        <div className="detail-hero-content">
          <Link to="/events" className="back-link">
            ← Back to events
          </Link>

          <div className="mt-4 mb-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                badgeStyles[event.type] ?? "bg-gray-100 text-gray-800"
              }`}
            >
              {event.type}
            </span>
          </div>

          <h1>{event.title}</h1>
          {/* No time here: on a multi-day range "· 10:30" would read as if it
              belonged to the end date. The exact start time is its own row in
              the details panel below. */}
          <p className="detail-date">{dateText}</p>
        </div>
      </section>

      {event.imageUrl && (
        <section className="detail-image-section">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="mx-auto h-auto max-h-[70vh] w-full max-w-4xl rounded-lg object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </section>
      )}

      <section className="detail-content">
        <div className="detail-main">
          <p className="section-label">ABOUT THE EVENT</p>
          <h2>About this event</h2>
          <RichText html={event.description} />
        </div>

        <aside className="detail-info">
          <p className="section-label">EVENT DETAILS</p>

          <div className="info-item">
            <span>Type</span>
            <strong className="capitalize">{event.type}</strong>
          </div>

          <div className="info-item">
            <span>Date & Time</span>
            <div>
              <strong className="block">Start: {fmt(event.startDate)} at {fmtTime(event.startDate)}</strong>
              <strong className="block mt-1">End: {fmt(event.endDate)} at {fmtTime(event.endDate)}</strong>
            </div>
          </div>

          {time && (
            <div className="info-item">
              <span>Time</span>
              <strong>{time}</strong>
            </div>
          )}

          <div className="info-item">
            <span>Location</span>
            <strong>{event.location}</strong>
          </div>

          <div className="info-item">
            <span>Availability</span>
            <strong className={spotsColor}>
              {soldOut ? "Fully booked" : `${spotsLeft} of ${event.capacity} spots left`}
            </strong>
          </div>

          {/*
            The registration step is P5's. Without this link the page had no way
            to reach it at all — main's only call to action was "Plan Your Visit".
          */}
          {soldOut ? (
            <button
              disabled
              className="primary-button detail-button cursor-not-allowed opacity-50"
            >
              Registration closed
            </button>
          ) : (
            <Link
              to={`/events/${data._id ?? data.id}/register`}
              className="primary-button detail-button"
            >
              Register for this event
            </Link>
          )}

          <Link to="/visit" className="secondary-button detail-button">
            Plan Your Visit
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default EventDetail;
