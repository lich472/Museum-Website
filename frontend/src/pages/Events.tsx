import { useEffect, useState } from "react";
import axios from "../lib/axios";
import EventCard from "../components/EventCard";
import { IEvent } from "../types";
import { useSearchSort } from "../hooks/useSearchSort";
import SearchSortBar from "../components/SearchSortBar";
import PageHeader from "../components/PageHeader";


// Defined outside the component so they aren't recreated on every render.
const searchText = (e: IEvent) =>
  [e.title, e.description, e.type, e.location].join(" ");
const dateOf = (e: IEvent) => e.startDate;

function Events() {
  usePageTitle("Events");

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Kept apart from the list: a failed request renders as a failure instead of
  // an empty grid.
  const [error, setError] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<number>(0);

  // Must be called before the early return below (rules of hooks).
  const { query, setQuery, order, setOrder, results } = useSearchSort(events, {
    getSearchText: searchText,
    getDate: dateOf,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await axios.get<{ events: IEvent[] }>("/events");

        if (response.data && Array.isArray(response.data.events)) {
          setEvents(response.data.events);
        } else if (Array.isArray(response.data)) {
          setEvents(response.data);
        }
      } catch (err) {
        console.error("Error fetching all events:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [attempt]);

  if (loading) {
    return (
      <main className="loading" style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Loading events...</h1>
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        eyebrow="Discover"
        title="Events"
        description="Explore current and upcoming events that bring history, culture, art and regional stories to life."
        image="images/event_bg.jpg"
      />

      <section className="exhibitions-page">
        {events.length > 0 && (
          <SearchSortBar
            query={query}
            onQueryChange={setQuery}
            order={order}
            onOrderChange={setOrder}
            label="events"
            resultCount={results.length}
            totalCount={events.length}
          />
        )}

        <div className="exhibition-grid">
          {results.map((event, index) => (
            <EventCard
              key={event._id}
              event={event}
              number={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Events;