import { useEffect, useState } from "react";
import axios from "../lib/axios.ts"; 
import CollectionCard from "../components/CollectionCard";

function Collections() {
  const [collectionItems, setCollectionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get("/collections");
        const fetchedData = response.data?.collections || (Array.isArray(response.data) ? response.data : []);
        setCollectionItems(fetchedData);
      } catch (err) {
        console.error("Error loading museum collection items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <main>
      <section className="page-header">
        <div className="page-header-content">
          <p className="section-label">EXPLORE THE COLLECTION</p>
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
          <p className="section-label">FEATURED OBJECTS</p>
          <h2>Stories preserved through objects</h2>
          <p>Explore a selection of significant objects from across our museum collection.</p>
        </div>

        {loading ? (
          <div className="loading" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading historical catalog...</p>
          </div>
        ) : (
          <div className="collection-grid">
            {collectionItems.length > 0 ? (
              collectionItems.map((item, index) => (
                <CollectionCard
                  key={item._id} 
                  item={item}
                  number={`0${index + 1}`}
                />
              ))
            ) : (
              <div className="no-data" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                <p>No collection items match the current catalog.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Collections;
