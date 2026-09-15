import exhibitions from "../data/exhibitions";
import ExhibitionCard from "../components/ExhibitionCard";

function Exhibitions() {
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

export default Exhibitions;