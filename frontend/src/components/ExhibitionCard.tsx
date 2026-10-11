import { Link } from "react-router-dom";
import { IExhibition } from "../types"; // Import the type matching your MongoDB Schema
import { formatDateRange } from "../utils/date";

// Explicitly type the component's incoming props for TypeScript safety
interface ExhibitionCardProps {
  exhibition: IExhibition;
  number: string;
}

function ExhibitionCard({ exhibition, number }: ExhibitionCardProps) {
  // Exhibition start/end are date-only values, so they render as dd/mm/yyyy.
  const dateRange = formatDateRange(exhibition.startDate, exhibition.endDate);

  return (
    <article className="exhibition-card">
      <div className="exhibition-image-placeholder">
        {/* Changed .image to your real backend property .imageUrl */}
        {exhibition.imageUrl ? (
          <img
            src={exhibition.imageUrl}
            alt={exhibition.title}
            className="exhibition-photo"
          />
        ) : (
          <span>{number}</span>
        )}
      </div>

      <div className="exhibition-card-content">
        {/* Replaced mock .category with an optional chain join over your database tags, fallback to status */}
        <p className="exhibition-category">
          {exhibition.tags && exhibition.tags.length > 0 
            ? exhibition.tags.join(", ") 
            : exhibition.status?.toUpperCase() || "EXHIBITION"}
        </p>

        <h3>{exhibition.title}</h3>

        {/* dd/mm/yyyy; hidden entirely when the source has no dates */}
        {dateRange && <p className="exhibition-date">{dateRange}</p>}

        <p className="exhibition-description">
          {exhibition.description}
        </p>

        {/* Updated path routing reference hook to target the MongoDB string _id */}
        <Link
          to={`/exhibitions/${exhibition._id}`}
          className="discover-link"
        >
          Discover Exhibition →
        </Link>
      </div>
    </article>
  );
}

export default ExhibitionCard;
