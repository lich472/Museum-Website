import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { IExhibition } from "../types"; // Make sure your types file matches the MongoDB schema fields
import ExhibitionCard from "../components/ExhibitionCard";
import { apiFetch } from "../api/client";
import { formatDateRange } from "../utils/date";

/** An exhibition suggested as similar, plus why it was suggested. */
type Recommendation = IExhibition & {
  sharedTags?: string[];
  sharedCount?: number;
};

/**
 * Both backends can serve recommendations but wrap and shape them differently:
 * the TypeScript backend answers `{ recommendations: [...] }` with full
 * exhibition documents, while `backend-fallback/` answers
 * `{ success, data: [...] }` with a slimmer item that carries `id` instead of
 * `_id`. Normalise both into `IExhibition` plus the optional explainer fields.
 */
function readRecommendations(payload: unknown): Recommendation[] {
  const container = payload as {
    recommendations?: unknown;
    data?: unknown;
  } | null;

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(container?.recommendations)
      ? container!.recommendations
      : Array.isArray(container?.data)
        ? container!.data
        : [];

  return (list as Array<Partial<IExhibition> & { id?: string | number }>).map(
    (item) => ({ ...item, _id: item._id ?? String(item.id ?? "") }) as Recommendation
  );
}

function ExhibitionDetail() {
  const { id } = useParams(); // MongoDB uses string ObjectIds (no type assertion required)
  const [exhibition, setExhibition] = useState<IExhibition | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        setLoading(true);
        const response = await axios.get<IExhibition>(`/api/exhibitions/${id}`);
        setExhibition(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching exhibition detail:", err);
        setError("Exhibition Not Found");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExhibition();
  }, [id]);

  // Recommendations are a nice-to-have, so they are fetched separately: if this
  // request fails the exhibition itself still renders.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchRecommendations = async () => {
      try {
        const response = await apiFetch(`/recommendations?exhibitionId=${id}`);
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled) setRecommendations(readRecommendations(payload));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Keep your exact original "not found" or loading template structure
  if (loading) {
    return (
      <main className="loading" style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Loading details...</h1>
      </main>
    );
  }

  if (error || !exhibition) {
    return (
      <main className="not-found">
        <h1>Exhibition Not Found</h1>
        <Link to="/exhibitions">← Back to Exhibitions</Link>
      </main>
    );
  }

  // dd/mm/yyyy, replacing the mock .date field
  const dateRange = formatDateRange(exhibition.startDate, exhibition.endDate);

  return (
    <main>
      <section className="detail-hero">
        <div className="detail-hero-content">
          <Link to="/exhibitions" className="back-link">
            ← Back to Exhibitions
          </Link>

          {/* Replaced .category with a safe array-join fallback matching your Mongoose tags or status */}
          <p className="section-label">
            {exhibition.tags && exhibition.tags.length > 0 
              ? exhibition.tags.join(", ") 
              : exhibition.status?.toUpperCase() || "EXHIBITION"}
          </p>

          <h1>{exhibition.title}</h1>

          <p className="detail-date">{dateRange}</p>
        </div>
      </section>

      {/* Changed .image reference to match your Mongoose .imageUrl schema key */}
      {exhibition.imageUrl && (
        <section className="detail-image-section">
          <img
            src={exhibition.imageUrl}
            alt={exhibition.title}
            className="detail-image"
          />
        </section>
      )}

      <section className="detail-content">
        <div className="detail-main">
          <p className="section-label">ABOUT THE EXHIBITION</p>

          <h2>A story worth discovering</h2>

          <p>{exhibition.description}</p>

          <p>
            Discover carefully selected objects, stories and
            cultural perspectives that provide visitors with a
            deeper understanding of this exhibition and its
            significance.
          </p>
        </div>

        <aside className="detail-info">
          <p className="section-label">VISITOR INFORMATION</p>

          <div className="info-item">
            <span>Location</span>
            {/* Swapped hardcoded text with your real Mongoose dynamic .room property */}
            <strong>{exhibition.room || "Gallery One"}</strong>
          </div>

          <div className="info-item">
            <span>Admission</span>
            <strong>Free Entry</strong>
          </div>

          <div className="info-item">
            <span>Opening Hours</span>
            <strong>10:00 – 17:00</strong>
          </div>

          <Link to="/visit" className="primary-button detail-button">
            Plan Your Visit
          </Link>
        </aside>
      </section>

      {/* Similar exhibitions, matched on shared tags by GET /api/recommendations */}
      {recommendations.length > 0 && (
        <section className="related-exhibitions">
          <div className="related-exhibitions-heading">
            <p className="section-label">CONTINUE EXPLORING</p>

            <h2>You Might Also Like</h2>

            <p>
              Based on the topics this exhibition shares with others in the
              museum.
            </p>
          </div>

          <div className="related-exhibitions-grid">
            {recommendations.map((recommendation, index) => (
              <ExhibitionCard
                key={recommendation._id}
                exhibition={recommendation}
                number={String(index + 1).padStart(2, "0")}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ExhibitionDetail;
