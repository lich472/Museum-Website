import { useEffect, useState } from "react";
import axios from "axios";
import ExhibitionCard from "../components/ExhibitionCard";
import { IExhibition } from "../types"; // Import the shared type interface

function Home() {
  const [exhibitions, setExhibitions] = useState<IExhibition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        // Enforce the shape matching your backend payload { exhibitions: [...] }
        const response = await axios.get<{ exhibitions: IExhibition[] }>("/api/exhibitions");
        
        // Filter array to only include featured items if your backend model has 'isHighlight' set to true
        const featuredItems = response.data.exhibitions.filter(item => item.isHighlight);
        
        // Fallback: If no items are flagged as highlights yet, show the first 3 exhibitions
        if (featuredItems.length === 0) {
          setExhibitions(response.data.exhibitions.slice(0, 3));
        } else {
          setExhibitions(featuredItems);
        }
      } catch (err) {
        console.error("Error fetching homepage exhibitions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

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
        ) : (
          <div className="exhibition-grid">
            {exhibitions.map((exhibition, index) => (
              <ExhibitionCard
                key={exhibition._id} // Uses MongoDB _id string instead of mock id number
                exhibition={exhibition}
                number={`0${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
