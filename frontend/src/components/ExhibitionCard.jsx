
import { Link } from "react-router-dom";

function ExhibitionCard({ exhibition, number }) {
  return (
    <article className="exhibition-card">
      <div className="exhibition-image-placeholder">
        {exhibition.image ? (
          <img
            src={exhibition.image}
            alt={exhibition.title}
            className="exhibition-photo"
          />
        ) : (
          <span>{number}</span>
        )}
      </div>

      <div className="exhibition-card-content">
        <p className="exhibition-category">
          {exhibition.category}
        </p>

        <h3>{exhibition.title}</h3>

        <p className="exhibition-date">
          {exhibition.date}
        </p>

        <p className="exhibition-description">
          {exhibition.description}
        </p>

        <Link
          to={`/exhibitions/${exhibition.id}`}
          className="discover-link"
        >
          Discover Exhibition →
        </Link>
      </div>
    </article>
  );
}

export default ExhibitionCard;