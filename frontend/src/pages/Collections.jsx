import collections from "../data/collections";
import CollectionCard from "../components/CollectionCard";

function Collections() {
  return (
    <main>

      <section className="page-header">
        <div className="page-header-content">

          <p className="section-label">
            EXPLORE THE COLLECTION
          </p>

          <h1>Collection Highlights</h1>

          <p>
            Discover selected objects, artworks and cultural
            materials from the Regional Museum collection.
            Each object tells a unique story about people,
            place and history.
          </p>

        </div>
      </section>


      <section className="collections-page">

        <div className="collections-intro">
          <p className="section-label">
            FEATURED OBJECTS
          </p>

          <h2>
            Stories preserved through objects
          </h2>

          <p>
            Explore a selection of significant objects from
            across our museum collection.
          </p>
        </div>


        <div className="collection-grid">

          {collections.map((item, index) => (
            <CollectionCard
              key={item.id}
              item={item}
              number={`0${index + 1}`}
            />
          ))}

        </div>

      </section>

    </main>
  );
}

export default Collections;