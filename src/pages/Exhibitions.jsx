
import { useState } from "react";
import exhibitions from "../data/exhibitions";
import ExhibitionCard from "../components/ExhibitionCard";

function Exhibitions() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter exhibitions based on user search
  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      exhibition.title.toLowerCase().includes(search) ||
      exhibition.category.toLowerCase().includes(search) ||
      exhibition.description.toLowerCase().includes(search)
    );
  });

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

        {/* Exhibition Search Bar */}
        <div className="exhibition-search">
          <input
            type="search"
            placeholder="Search exhibitions..."
            aria-label="Search exhibitions"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {/* Exhibition Cards */}
        <div className="exhibition-grid">
          {filteredExhibitions.map((exhibition, index) => (
            <ExhibitionCard
              key={exhibition.id}
              exhibition={exhibition}
              number={`0${index + 1}`}
            />
          ))}
        </div>

        {/* No Search Results */}
        {filteredExhibitions.length === 0 && (
          <p className="no-results">
            No exhibitions found. Please try another search.
          </p>
        )}

      </section>
    </main>
  );
}

export default Exhibitions;
