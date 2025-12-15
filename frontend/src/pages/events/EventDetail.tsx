import { useParams, useNavigate } from "react-router-dom";
import { useEventDetail, useBuyTicket } from "../../api/queries";
import "./events.css";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError, error } = useEventDetail(id!);
  const buyTicketMutation = useBuyTicket();

  if (isLoading) return <div className="loading">Chargement...</div>;

  if (isError || !event) {
    return (
      <div className="error">
        Erreur : {error instanceof Error ? error.message : "Événement non trouvé"}
      </div>
    );
  }

  const handleBuyTicket = async () => {
    try {
      const result = await buyTicketMutation.mutateAsync(event.id);
      // Rediriger vers le checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      console.error("Erreur lors de l'achat du billet:", err);
    }
  };

  return (
    <div className="event-detail-container">
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="event-detail-image" />
      )}

      <div className="event-detail-content">
        <h1>{event.title}</h1>

        <div className="event-detail-info">
          <div className="info-item">
            <label>Date :</label>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>

          <div className="info-item">
            <label>Lieu :</label>
            <span>{event.location}</span>
          </div>

          <div className="info-item">
            <label>Prix :</label>
            <span className="price">{event.price}€</span>
          </div>

          <div className="info-item">
            <label>Places :</label>
            <span>
              {event.remaining} / {event.capacity} disponibles
            </span>
          </div>

          {event.organizer && (
            <div className="info-item">
              <label>Organisateur :</label>
              <span>{event.organizer.name}</span>
            </div>
          )}
        </div>

        <div className="event-description">
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-actions">
          <button
            onClick={handleBuyTicket}
            disabled={event.remaining === 0 || buyTicketMutation.isPending}
            className="btn-primary"
          >
            {buyTicketMutation.isPending ? "Achat en cours..." : "Acheter un billet"}
          </button>
          <button onClick={() => navigate("/events")} className="btn-secondary">
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
