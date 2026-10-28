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

      <Link
        to={`/exhibitions/${exhibition._id}`}
      >
        <div className="exhibition-card-content">
          {/* Replaced mock .category with an optional chain join over your database tags, fallback to status */}
          <p className="exhibition-category">
            {exhibition.tags && exhibition.tags.length > 0 
              ? exhibition.tags.join(", ") 
              : exhibition.status?.toUpperCase() || "EXHIBITION"}
          </p>

          <h3>{exhibition.title}</h3>

          {/* Dynamic localized date span strings matching your layout grid expectations */}
          <p className="exhibition-date">
            {formattedStartDate} – {formattedEndDate}
          </p>

          <p className="exhibition-description">
            {exhibition.description}
          </p>
        </div>
      </Link>

    </article>
  );
}

export default ExhibitionCard;
