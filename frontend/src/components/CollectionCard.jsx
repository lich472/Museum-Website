import { Link } from "react-router-dom";

function CollectionCard({ item, number }) {
  return (
    <article className="collection-card">
      <div className="collection-image">
        {item.imageUrl || item.image ? (
          <img
            src={item.imageUrl || item.image}
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

        {/* Updated path configuration targeting your live database MongoDB _id field */}
        <Link
          to={`/collections/${item._id}`}
          className="discover-link"
        >
          Discover Object →
        </Link>
      </div>
    </article>
  );
}

export default CollectionCard;
