import { useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../../api/queries";
import { useAuth } from "../../context/AuthContext";
import "../events.css";

export function EventList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  // Debounce search manually or via effect if needed, simpler here is passing directly or debounce hook
  // We will pass search directly for now, improvements can be added later
  const { data: response, isLoading, isError, error } = useEvents(page, 10, search);

  if (isLoading) return <div className="loading">Chargement des événements...</div>;

  if (isError) {
    return (
      <div className="error">
        Erreur : {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  const events = response?.data || [];
  const meta = response?.meta;

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
          placeholder="Rechercher un événement..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Grille d'événements */}
      <div className="events-grid">
        {events.length === 0 ? (
          // Show friendly placeholders when no events are returned
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="event-card" aria-hidden>
              <div style={{ width: '100%', height: 200, background: 'linear-gradient(90deg,#f3f4f6,#e5e7eb)' }} />
              <div className="event-card-content">
                <h3 style={{ background: '#e9ecef', color: 'transparent' }}>Placeholder title</h3>
                <p className="event-date" style={{ background: '#eef2f7', color: 'transparent' }}>Date</p>
                <p className="event-location" style={{ background: '#eef2f7', color: 'transparent' }}>Location</p>
                <p className="event-price" style={{ background: '#eef2f7', color: 'transparent' }}>Price</p>
              </div>
            </div>
          ))
        ) : (
          events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="event-card">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} />
              ) : (
                <div style={{ width: '100%', height: 200, background: 'var(--neutral-100)' }} />
              )}
              <div className="event-card-content">
                <h3>{event.title}</h3>
                <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
                <p className="event-location">{event.location}</p>
                <p className="event-price">{event.price}€</p>
                <p className="event-capacity">Places disponibles : {event.remaining}/{event.capacity}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </button>
          <span>Page {page} sur {meta.last_page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.last_page}>
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
