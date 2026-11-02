import { Link } from "react-router-dom";
import { IEvent } from "../types"; // Import the type matching your MongoDB Schema
import { previewText } from "../utils/richText";

// Explicitly type the component's incoming props for TypeScript safety
interface EventCardProps {
  event: IEvent;
  number: string;
}

function EventCard({ event, number }: EventCardProps) {
  // Format MongoDB date strings into human-friendly strings to display instead of the old mock .date field
  const formattedStartDate = new Date(event.startDate).toLocaleDateString();
  const formattedEndDate = new Date(event.endDate).toLocaleDateString();

  const spotsLeft = event.spotRemaining ?? event.capacity;
  const soldOut = spotsLeft <= 0;
  const spotsColor = soldOut
    ? "text-red-600"
    : spotsLeft <= 5
    ? "text-orange-500"
    : "text-green-600";

  return (
    <article className="exhibition-card">
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
            {previewText(event.description)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default EventCard;
