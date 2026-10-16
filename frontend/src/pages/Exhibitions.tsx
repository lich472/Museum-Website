import { useEffect, useState } from "react";
import axios from "../lib/axios";
import ExhibitionCard from "../components/ExhibitionCard";
import { IExhibition } from "../types"; // Shared interface with MongoDB fields
import usePageTitle from "../utils/usePageTitle";

function Exhibitions() {
  usePageTitle("Exhibitions");

  const [exhibitions, setExhibitions] = useState<IExhibition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Kept apart from the list so a failed request renders as a failure rather
  // than as an empty grid.
  const [error, setError] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        setError(false);
        // Calls your backend getAllExhibition controller route
        const response = await axios.get<{ exhibitions: IExhibition[] }>("/exhibitions");
        
        // Defensive check: handle both object envelopes and direct array fallbacks safely
        if (response.data && Array.isArray(response.data.exhibitions)) {
          setExhibitions(response.data.exhibitions);
        } else if (Array.isArray(response.data)) {
          setExhibitions(response.data);
        }
      } catch (err) {
        console.error("Error fetching all exhibitions:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [attempt]);

  if (loading) {
    return (
      <main className="loading" style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Loading exhibitions...</h1>
      </main>
    );
  }

  return (
    <main>
      <section className="page-header">
        <div className="page-header-content">
          <p className="section-label">DISCOVER</p>

          <h1>Exhibitions</h1>

          <p>
            Explore current and upcoming exhibitions that bring
            history, culture, art and regional stories to life.
          </p>
        </div>
      </section>

      <section className="exhibitions-page">
        {/* The cards below title themselves with <h3> (`.exhibition-card h3`
            in App.css is what sizes them, so the tag cannot move up to h2
            without changing how they look). The outline therefore needs a
            level-2 group heading here; it is visually hidden because the page
            <h1> and its description already introduce the same grid. */}
        <h2 className="sr-only">All exhibitions</h2>
        {error ? (
          /* Failure state, distinct from both the list and the empty state. */
          <div className="state-error" role="status">
            <p>Exhibitions are unavailable right now.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setAttempt((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : exhibitions.length > 0 ? (
          <div className="exhibition-grid">
            {exhibitions.map((exhibition, index) => (
              <ExhibitionCard
                key={exhibition._id} // Swapped mock id for MongoDB string _id
                exhibition={exhibition}
                number={`0${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <p className="state-empty">No exhibitions are currently listed.</p>
        )}
      </section>
    </main>
  );
}

export default Exhibitions;
