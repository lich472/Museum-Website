import { useEffect, useState } from "react";
import axios from "../lib/axios.ts";
import CollectionCard from "../components/CollectionCard";
import { useSearchSort } from "../hooks/useSearchSort";
import SearchSortBar from "../components/SearchSortBar";
import PageHeader from "../components/PageHeader";


// Defined outside the component so they aren't recreated on every render.
// Put the date field your collection items really have first in dateOf.
const searchText = (c) =>
  [c.title ?? c.name, c.description, c.category, ...(c.tags ?? [])].join(" ");
const dateOf = (c) => c.year ?? c.dateCreated ?? c.createdAt;

function Collections() {
  usePageTitle("Collections");

  const [collectionItems, setCollectionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // True only when the request itself failed, so an outage can never be shown
  // as "no items match the catalog".
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const { query, setQuery, order, setOrder, results } = useSearchSort(collectionItems, {
    getSearchText: searchText,
    getDate: dateOf,
  });

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await axios.get("/collections");
        const fetchedData =
          response.data?.collections ||
          (Array.isArray(response.data) ? response.data : []);
        setCollectionItems(fetchedData);
      } catch (err) {
        console.error("Error loading museum collection items:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [attempt]);

  return (
    <main>
      <PageHeader
        eyebrow="EXPLORE THE COLLECTION"
        title="Collection Highlights"
        description="Discover selected objects, artworks and cultural
            materials from the Regional Museum collection.
            Each object tells a unique story about people,
            place and history."
        image="images/collection_bg.webp"
      />

      <section className="collections-page">
        <div className="collections-intro">
          <p className="section-label">FEATURED OBJECTS</p>
          <h2>Stories preserved through objects</h2>
          <p>Explore a selection of significant objects from across our museum collection.</p>
        </div>

        {loading ? (
          <div className="loading" style={{ textAlign: "center", padding: "3rem" }}>
            <p>Loading historical catalog...</p>
          </div>
        ) : error ? (
          /* Distinct failure branch: the empty-state copy below is only for a
             request that succeeded and genuinely returned nothing. */
          <div className="state-error" role="alert">
            <p>We couldn't load the collection right now.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setAttempt((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {collectionItems.length > 0 && (
              <SearchSortBar
                query={query}
                onQueryChange={setQuery}
                order={order}
                onOrderChange={setOrder}
                label="collection items"
                resultCount={results.length}
                totalCount={collectionItems.length}
              />
            )}

            <div className="collection-grid">
              {collectionItems.length === 0 ? (
                <div
                  className="no-data"
                  style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}
                >
                  <p>No collection items in the catalog yet.</p>
                </div>
              ) : (
                results.map((item, index) => (
                  <CollectionCard
                    key={item._id}
                    item={item}
                    number={String(index + 1).padStart(2, "0")}
                  />
                ))
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Collections;