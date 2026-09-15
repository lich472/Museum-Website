import exhibitions from "../data/exhibitions";
import ExhibitionCard from "../components/ExhibitionCard";

function Home() {
  return (
    <main>

      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">
            WELCOME TO THE REGIONAL MUSEUM
          </p>

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


        <div className="exhibition-grid">
          {exhibitions.map((exhibition, index) => (
            <ExhibitionCard
              key={exhibition.id}
              exhibition={exhibition}
              number={`0${index + 1}`}
            />
          ))}
        </div>

      </section>

    </main>
  );
}

export default Home;