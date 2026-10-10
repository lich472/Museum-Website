
import { Link } from "react-router-dom";

function CollectionCard({ item, number }) {
  return (
    <article className="collection-card">
      <div className="collection-image">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="collection-photo"
          />
        ) : (
          <span>{number}</span>
        )}
      </div>

      <div className="collection-card-content">
        <p className="collection-category">
          {item.category}
        </p>

        <h3>{item.title}</h3>

        <div className="collection-metadata">
          <span>{item.period}</span>
          <span>{item.origin}</span>
        </div>

        <p className="collection-description">
          {item.description}
        </p>

        <Link
          to={`/collections/${item.id}`}
          className="discover-link"
        >
          Discover Object →
        </Link>
      </div>
    </article>
  );
}

export default CollectionCard;