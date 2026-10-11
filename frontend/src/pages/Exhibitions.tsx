import { useEffect, useState } from "react";
import axios from "axios";
import ExhibitionCard from "../components/ExhibitionCard";
import type { IExhibition } from "../types"; // Shared interface with MongoDB fields

function Exhibitions() {
  const [exhibitions, setExhibitions] = useState<IExhibition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        // Calls your backend getAllExhibition controller route
        const response = await axios.get<{ exhibitions: IExhibition[] }>("/api/exhibitions");
        
        // Defensive check: handle both object envelopes and direct array fallbacks safely
        if (response.data && Array.isArray(response.data.exhibitions)) {
          setExhibitions(response.data.exhibitions);
        } else if (Array.isArray(response.data)) {
          setExhibitions(response.data);
        }
      } catch (err) {
        console.error("Error fetching all exhibitions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

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
        <div className="exhibition-grid">
          {/* Using a fallback array just in case state evaluates to null/undefined */}
          {(exhibitions || []).map((exhibition, index) => (
            <ExhibitionCard
              key={exhibition._id} // Swapped mock id for MongoDB string _id
              exhibition={exhibition}
              number={`0${index + 1}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Exhibitions;
