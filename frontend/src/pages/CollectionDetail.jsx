import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios.ts"; 
import CollectionCard from "../components/CollectionCard";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import RichText from "../components/RichText";

function CollectionDetail() {
  const { id } = useParams(); // Removed TypeScript generic brackets
  const [item, setItem] = useState(null);
  const [relatedCollections, setRelatedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  // `notFound` is only ever set for a real 404; `error` covers every other
  // failure (network, 500, timeout) so an outage cannot read as a deleted item.
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // The object's own name once it loads; "Collection" covers the fetch and the
  // not-found state, both of which render before it exists.
  usePageTitle(item ? item.title : "Collection");

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setLoading(true);
      setError(false);
      setNotFound(false);
      try {
        const itemResponse = await axios.get(`/collections/${id}`);
        setItem(itemResponse.data);
      } catch (err) {
        console.error("Error fetching collection detail from database:", err);
        // Only the item request may clear the item.
        setItem(null);
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, attempt]);

  // Related items are a nice-to-have, so they are fetched separately: a failure
  // here must never reach the code above and clear a valid item.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchRelated = async () => {
      setRelatedCollections([]);
      try {
        const listResponse = await axios.get("/collections");
        const allItems = listResponse.data?.collections || (Array.isArray(listResponse.data) ? listResponse.data : []);
        if (cancelled) return;
        const filteredRelated = allItems.filter((collection) => collection._id !== id);
        setRelatedCollections(filteredRelated.slice(0, 2));
      } catch (err) {
        // Losing the suggestions costs only the suggestions.
        console.warn("Error fetching related collection items:", err);
      }
    };

    fetchRelated();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <main className="state-error" role="alert">
        <h1>Collection Item Unavailable</h1>
        <p>We couldn't load this collection item right now. Please try again.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => setAttempt((current) => current + 1)}
        >
          Try again
        </button>
      </main>
    );
  }

  if (notFound || !item) {
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
            className="mx-auto h-auto max-h-[70vh] w-full max-w-4xl rounded-lg object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </section>
      )}

      <section className="detail-content">
        <div className="detail-main">
          <p className="section-label">ABOUT THE OBJECT</p>
          <h2>The story behind the object</h2>
          <RichText html={item.description} />
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
