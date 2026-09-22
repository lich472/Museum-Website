
import { useParams, Link } from "react-router-dom";
import collections from "../data/collections";
import CollectionCard from "../components/CollectionCard";

function CollectionDetail() {
  const { id } = useParams();

  const item = collections.find(
    (collection) => collection.id === Number(id)
  );

  if (!item) {
    return (
      <main className="not-found">
        <h1>Collection Item Not Found</h1>
        <Link to="/collections">← Back to Collections</Link>
      </main>
    );
  }

  const relatedCollections = collections.filter(
    (collection) => collection.id !== item.id
  );

  return (
    <main>
      <section className="detail-hero">
        <div className="detail-hero-content">
          <Link to="/collections" className="back-link">
            ← Back to Collections
          </Link>

          <p className="section-label">{item.category}</p>

          <h1>{item.title}</h1>

          <p className="detail-date">{item.period}</p>
        </div>
      </section>

      {item.image && (
        <section className="detail-image-section">
          <img
            src={item.image}
            alt={item.title}
            className="detail-image"
          />
        </section>
      )}

      <section className="detail-content">
        <div className="detail-main">
          <p className="section-label">ABOUT THE OBJECT</p>

          <h2>The story behind the object</h2>

          <p>{item.description}</p>
        </div>

        <aside className="detail-info">
          <p className="section-label">OBJECT INFORMATION</p>

          <div className="info-item">
            <span>Category</span>
            <strong>{item.category}</strong>
          </div>

          <div className="info-item">
            <span>Period</span>
            <strong>{item.period}</strong>
          </div>

          <div className="info-item">
            <span>Origin</span>
            <strong>{item.origin}</strong>
          </div>

          <Link
            to="/collections"
            className="primary-button detail-button"
          >
            Explore All Collections
          </Link>
        </aside>
      </section>

      {relatedCollections.length > 0 && (
        <section className="related-collections">
          <div className="related-collections-heading">
            <p className="section-label">CONTINUE EXPLORING</p>

            <h2>Explore More Objects</h2>

            <p>
              Discover more objects, artworks and stories from
              the museum collection.
            </p>
          </div>

          <div className="related-collections-grid">
            {relatedCollections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                item={collection}
                number={String(index + 1).padStart(2, "0")}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default CollectionDetail;