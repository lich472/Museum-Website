import { useEffect, useState } from "react";
// FIX: Import your custom axios instance instead of the raw axios package
import axios from "../lib/axios"; 
import ExhibitionCard from "../components/ExhibitionCard";
import { IExhibition } from "../types"; 
import usePageTitle from "../utils/usePageTitle";

function Home() {
  usePageTitle("Home");

  const [exhibitions, setExhibitions] = useState<IExhibition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // A failed request is not the same as "no exhibitions are on": the failure
  // gets its own state so the empty copy can never stand in for an outage.
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<{ exhibitions: IExhibition[] }>("/exhibitions");
        
        const rawExhibitions = response.data?.exhibitions || [];
        
        const featuredItems = rawExhibitions.filter(item => item.isHighlight);
        
        if (featuredItems.length === 0) {
          setExhibitions(rawExhibitions.slice(0, 3));
        } else {
          setExhibitions(featuredItems);
        }
      } catch (err) {
        console.error("Error fetching homepage exhibitions:", err);
        setError("We couldn't load the featured exhibitions.");
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [attempt]);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">WELCOME TO THE REGIONAL MUSEUM</p>
          <h1>
            Discover History.
            <br />
            Experience Culture.
          </h1>
          <p className="hero-description">
            Explore fascinating exhibitions, remarkable collections,
            and stories that connect our past with the present.
          </p>
          <div className="hero-buttons">
            <a href="/exhibitions" className="primary-button">
              Explore Exhibitions
            </a>
            <a href="/visit" className="secondary-button">
              Plan Your Visit
            </a>
          </div>
        </div>
      </section>

      <section className="featured-exhibitions">
        <div className="section-heading">
          <div>
            <p className="section-label">WHAT'S ON</p>
            <h2>Featured Exhibitions</h2>
          </div>
          <a href="/exhibitions" className="view-all-link">
            View All Exhibitions →
          </a>
        </div>

        {loading ? (
          <div className="loading"><p>Loading featured exhibits...</p></div>
        ) : error ? (
          /* Distinct failure state: only reached when the request failed, never
             for an empty result. */
          <div className="state-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setAttempt((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="exhibition-grid">
            {exhibitions && exhibitions.length > 0 ? (
              exhibitions.map((exhibition, index) => (
                <ExhibitionCard
                  key={exhibition._id} 
                  exhibition={exhibition}
                  number={`0${index + 1}`}
                />
              ))
            ) : (
              <div className="no-data"><p>No current exhibitions available.</p></div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
