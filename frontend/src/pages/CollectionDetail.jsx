import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios.ts"; 
import CollectionCard from "../components/CollectionCard";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

function CollectionDetail() {
  const { id } = useParams(); // Removed TypeScript generic brackets
  const [item, setItem] = useState(null);
  const [relatedCollections, setRelatedCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const itemResponse = await axios.get(`/collections/${id}`);
        setItem(itemResponse.data);

        const listResponse = await axios.get("/collections");
        const allItems = listResponse.data?.collections || (Array.isArray(listResponse.data) ? listResponse.data : []);
        
        const filteredRelated = allItems.filter((collection) => collection._id !== id);
        setRelatedCollections(filteredRelated.slice(0, 2));
      } catch (err) {
        console.error("Error fetching collection detail from database:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndRelated();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!item) {
    return (
      <main className="not-found" style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <h1>Collection Item Not Found</h1>
        <p style={{ margin: "1rem 0 2rem", color: "#666" }}>The requested historical catalog object could not be resolved.</p>
        <Link to="/collections" className="primary-button" style={{ padding: "12px 24px" }}>
          ← Back to Collections
        </Link>
      </main>
    );
  }

  const displayImage = item.imageUrl || item.image;

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

      {displayImage && (
        <section className="detail-image-section">
          <img
            src={displayImage}
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
            style={{ textAlign: "center" }}
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
                key={collection._id}
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
