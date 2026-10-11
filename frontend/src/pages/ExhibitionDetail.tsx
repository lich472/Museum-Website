import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import type { IExhibition } from "../types"; // Make sure your types file matches the MongoDB schema fields

function ExhibitionDetail() {
  const { id } = useParams(); // MongoDB uses string ObjectIds (no type assertion required)
  const [exhibition, setExhibition] = useState<IExhibition | null>(null);
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

  // Format MongoDB date strings into human-friendly formats to replace the old mock .date field
  const formattedStartDate = new Date(exhibition.startDate).toLocaleDateString();
  const formattedEndDate = new Date(exhibition.endDate).toLocaleDateString();

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

          <p className="detail-date">
            {formattedStartDate} – {formattedEndDate}
          </p>
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
            <strong>10:00 AM – 5:00 PM</strong>
          </div>

          <Link to="/visit" className="primary-button detail-button">
            Plan Your Visit
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default ExhibitionDetail;
