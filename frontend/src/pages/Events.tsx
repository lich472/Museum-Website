import { useEffect, useState } from "react";
import axios from "../lib/axios";
import EventCard from "../components/EventCard";
import { IEvent } from "../types"; // Shared interface with MongoDB fields
import usePageTitle from "../utils/usePageTitle";

function Events() {
  usePageTitle("Events");

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Kept apart from the list: a failed request renders as a failure instead of
  // an empty grid.
  const [error, setError] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<number>(0);

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

        console.log("events response:", response.data);
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
      <section className="page-header">
        <div className="page-header-content">
          <p className="section-label">DISCOVER</p>

          <h1>Events</h1>

          <p>
            Explore current and upcoming events that bring
            history, culture, art and regional stories to life.
          </p>
        </div>
      </section>

      <section className="exhibitions-page">
        {/* Same reason as /exhibitions: the event cards are <h3> (sized by
            `.exhibition-card h3`), so a level-2 group heading is needed here
            to avoid an h1 → h3 jump. Hidden because the <h1> above already
            introduces the list. */}
        <h2 className="sr-only">All events</h2>
        {error ? (
          /* Failure state, distinct from both the list and the empty state. */
          <div className="state-error" role="status">
            <p>Events are unavailable right now.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setAttempt((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : events.length > 0 ? (
          <div className="exhibition-grid">
            {events.map((event, index) => (
              <EventCard
                key={event._id} 
                event={event}
                number={`0${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <p className="state-empty">No events are currently listed.</p>
        )}
      </section>
    </main>
  );
}

export default Events;
