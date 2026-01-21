import { useUserTickets, useTransferTicket } from "../../api/queries";
import { Link } from "react-router-dom";
import "../tickets.css";

export function TicketsList() {
  const { data: tickets, isLoading, isError, error } = useUserTickets();
  const transferMutation = useTransferTicket();

  const handleTransfer = async (ticketId: string) => {
    const email = window.prompt("Entrez l'email du destinataire :");
    if (email) {
      if (!confirm(`Etes-vous sûr de vouloir transférer ce billet à ${email} ?`)) return;
      
      try {
        await transferMutation.mutateAsync({ ticketId, email });
        alert("Billet transféré avec succès !");
      } catch (err) {
        alert("Erreur lors du transfert : " + (err instanceof Error ? err.message : "Inconnue"));
      }
    }
  };

  if (isLoading) return <div className="loading">Chargement de vos billets...</div>;

  if (isError) {
    return (
      <div className="error">
        Erreur : {error instanceof Error ? error.message : "Impossible de charger les billets"}
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1>Mes billets</h1>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="no-tickets">
          <p>Vous n'avez pas encore acheté de billets.</p>
          <Link to="/events" className="btn-primary">
            Découvrir les événements
          </Link>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              {ticket.event && (
                <>
                  <h3>{ticket.event.title}</h3>
                  <p className="event-date">
                    {new Date(ticket.event.date).toLocaleDateString()}
                  </p>
                  <p className="event-location">{ticket.event.location}</p>
                </>
              )}

              <div className="ticket-qr">
                <img src={ticket.qrCode} alt="QR Code billet" />
              </div>

              <div className="ticket-info">
                <p className="ticket-id">Billet #{ticket.id.slice(0, 8)}</p>
                <p className={`ticket-status status-${ticket.status}`}>
                  {ticket.status === "paid" && "Payé"}
                  {ticket.status === "pending" && "En attente"}
                  {ticket.status === "used" && "Utilisé"}
                </p>
              </div>

              {ticket.status === "paid" && (
                <div className="ticket-actions">
                  <Link
                    to={`/tickets/${ticket.id}/validate`}
                    className="btn-secondary"
                  >
                    Valider le billet
                  </Link>
                  <button 
                    className="btn-secondary"
                    onClick={() => handleTransfer(ticket.id)}
                    style={{ marginLeft: '10px', backgroundColor: '#e74c3c' }}
                  >
                    Transférer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
