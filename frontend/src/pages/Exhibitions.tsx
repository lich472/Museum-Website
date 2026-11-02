import { useEffect, useState } from "react";
import axios from "../lib/axios";
import ExhibitionCard from "../components/ExhibitionCard";
import { IExhibition } from "../types";
import { useSearchSort } from "../hooks/useSearchSort";
import SearchSortBar from "../components/SearchSortBar";
import PageHeader from "../components/PageHeader";
import { stripHtml } from "../utils/richText";


const searchText = (x: IExhibition) =>
  [x.title, stripHtml(x.description), x.room, ...(x.tags ?? [])].join(" ");
const dateOf = (x: IExhibition) => x.startDate;

function Exhibitions() {
  const [exhibitions, setExhibitions] = useState<IExhibition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { query, setQuery, order, setOrder, results } = useSearchSort(exhibitions, {
    getSearchText: searchText,
    getDate: dateOf,
  });

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ exhibitions: IExhibition[] }>("/exhibitions");

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
      <PageHeader
        eyebrow="Discover"
        title="Exhibitions"
        description="Explore current and upcoming exhibitions that bring history, culture, art and regional stories to life."
        image="images/exhibition_bg.jpg"
      />

      <section className="exhibitions-page">
        {exhibitions.length > 0 && (
          <SearchSortBar
            query={query}
            onQueryChange={setQuery}
            order={order}
            onOrderChange={setOrder}
            label="exhibitions"
            resultCount={results.length}
            totalCount={exhibitions.length}
          />
        )}

        <div className="exhibition-grid">
          {results.map((exhibition, index) => (
            <ExhibitionCard
              key={exhibition._id}
              exhibition={exhibition}
              number={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Exhibitions;