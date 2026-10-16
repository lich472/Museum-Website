import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { IEvent } from "../types";
import { formatDateLong, eventTime } from "../utils/date";

const badgeStyles: Record<string, string> = {
  workshop: "bg-blue-100 text-blue-800",
  talk: "bg-purple-100 text-purple-800",
  tour: "bg-green-100 text-green-800",
};

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ event: IEvent } | IEvent>(`/events/${id}`);
        setEvent("event" in response.data ? response.data.event : response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError("Event not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <main className="loading" style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Loading details...</h1>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="not-found">
        <h1>Event not found</h1>
        <Link to="/events">← Back to events</Link>
      </main>
    );
  }

  const sameDay =
    new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString();
  const dateText = sameDay
    ? formatDateLong(event.startDate)
    : `${formatDateLong(event.startDate)} – ${formatDateLong(event.endDate)}`;

  // Ported from the Jason_P5 detail page: main did not surface the start time.
  const time = eventTime(event);

  // `spotRemaining` is a real field on the Event schema, so this shows the
  // stored value. It is set by an admin rather than recalculated, so once event
  // registration is implemented it should be kept in step with
  // `capacity - registrations`.
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
          <p>{event.description}</p>
        </div>

        <aside className="detail-info">
          <p className="section-label">EVENT DETAILS</p>

          <div className="info-item">
            <span>Type</span>
            <strong className="capitalize">{event.type}</strong>
          </div>

          <div className="info-item">
            <span>Date</span>
            <div>
              <strong className="block">Start: {formatDateLong(event.startDate)}</strong>
              <strong className="block">End: {formatDateLong(event.endDate)}</strong>
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
              to={`/events/${event._id}/register`}
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
