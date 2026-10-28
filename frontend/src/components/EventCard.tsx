import { Link } from "react-router-dom";
import { IEvent } from "../types"; // Import the type matching your MongoDB Schema
import { formatDateLong, eventTime } from "../utils/date";

// Explicitly type the component's incoming props for TypeScript safety
interface EventCardProps {
  event: IEvent;
  number: string;
}

/**
 * Ported from the Jason_P5 event list: the availability line, the start time,
 * the location and a trimmed description, expressed with this site's card
 * classes rather than the inline styles the P5 version used, so the events grid
 * matches the exhibitions grid.
 *
 * Note on availability: events reach the frontend in two shapes. The TypeScript
 * backend sends `spotRemaining` and an ObjectId `_id`; `backend-fallback/`
 * sends `spotsRemaining` and a numeric `id`. Both are read here, and `capacity`
 * is only the last resort — reading `capacity` alone made a sold-out fallback
 * event report full availability.
 */
function EventCard({ event, number }: EventCardProps) {
  const data = event as IEvent & { spotsRemaining?: number; id?: string | number };
  const left = data.spotRemaining ?? data.spotsRemaining ?? data.capacity;
  const soldOut = left <= 0;
  const spotsColor = soldOut
    ? "text-red-600"
    : left <= 5
    ? "text-orange-500"
    : "text-green-600";

  const time = eventTime(event);
  const description =
    event.description && event.description.length > 110
      ? `${event.description.slice(0, 110)}…`
      : event.description;

  return (
    <article className={`exhibition-card${soldOut ? " opacity-75" : ""}`}>
      <div className="exhibition-image-placeholder">
        {/* Changed .image to your real backend property .imageUrl */}
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="exhibition-photo"
          />
        ) : (
          <span>{number}</span>
        )}
      </div>

      <Link
        to={`/events/${event._id}`}
        className="discover-link"
      >
        <div className="exhibition-card-content">
          <p className="exhibition-category capitalize">{event.type}</p>

          <h3>{event.title}</h3>

          <p className={`text-sm font-semibold ${spotsColor}`}>
            {soldOut ? "Fully booked" : `Spots remaining: ${spotsLeft}`}
          </p>

          <p className="exhibition-date">
            {formattedStartDate} – {formattedEndDate}
          </p>

          <p className="exhibition-description">
            {event.description}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default EventCard;
