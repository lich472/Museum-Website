import { useParams, Link } from "react-router-dom";
import exhibitions from "../data/exhibitions";

function ExhibitionDetail() {
  const { id } = useParams();

  const exhibition = exhibitions.find(
    (item) => item.id === Number(id)
  );

  if (!exhibition) {
    return (
      <main className="not-found">
        <h1>Exhibition Not Found</h1>
        <Link to="/exhibitions">← Back to Exhibitions</Link>
      </main>
    );
  }

  return (
    <main>
      <section className="detail-hero">
        <div className="detail-hero-content">
          <Link to="/exhibitions" className="back-link">
            ← Back to Exhibitions
          </Link>

          <p className="section-label">
            {exhibition.category}
          </p>

          <h1>{exhibition.title}</h1>

          <p className="detail-date">
            {exhibition.date}
          </p>
        </div>
      </section>

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
            <strong>Gallery One</strong>
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