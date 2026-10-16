import { useEffect, useState } from "react";
import axios from "../lib/axios";
import EventCard from "../components/EventCard";
import { IEvent } from "../types"; // Shared interface with MongoDB fields

function Events() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ events: IEvent[] }>("/events");
        
        if (response.data && Array.isArray(response.data.events)) {
          setEvents(response.data.events);
        } else if (Array.isArray(response.data)) {
          setEvents(response.data);
        }

        console.log("events response:", response.data);
      } catch (err) {
        console.error("Error fetching all events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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

          <h1>events</h1>

          <p>
            Explore current and upcoming events that bring
            history, culture, art and regional stories to life.
          </p>
        </div>
      </section>

      <section className="exhibitions-page">
        <div className="exhibition-grid">
          {(events || []).map((event, index) => (
            <EventCard
              key={event._id} 
              event={event}
              number={`0${index + 1}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Events;
