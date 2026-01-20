import { useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../../api/queries";
import { useAuth } from "../../context/AuthContext";
import "../events.css";

export function EventList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>("");
  const { data, isLoading, isError, error } = useEvents(page, 10);

  if (isLoading) return <div className="loading">Chargement des événements...</div>;

  if (isError) {
    return (
      <div className="error">
        Erreur : {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  const events = data || [];

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Événements disponibles</h1>
        {user?.role === "organizer" && (
          <Link to="/create-event" className="btn-primary">
            Créer un événement
          </Link>
        )}
      </div>

      {/* Filtrage */}
      <div className="events-filter">
        <input
          type="text"
          placeholder="Filtrer par catégorie..."
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Grille d'événements */}
      <div className="events-grid">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`} className="event-card">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} />
            )}
            <div className="event-content">
              <h3>{event.title}</h3>
              <p className="event-date">
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="event-location">{event.location}</p>
              <p className="event-price">{event.price}€</p>
              <p className="event-capacity">
                Places disponibles : {event.remaining}/{event.capacity}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Précédent
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={events.length < 10}>
          Suivant
        </button>
      </div>
    </div>
  );
}
